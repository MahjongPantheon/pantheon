import { env } from './env';
import { sendAlreadyRegisteredMail, sendPasswordRecovery, sendSignupMail } from './mailer';

jest.mock('./env', () => ({
  env: {
    mailer: {
      remoteUrl: 'https://mail.test.example/send',
      remoteActionKey: 'test-action-key',
      mailerAddr: 'noreply@test.example',
      guiUrl: 'https://pantheon.test.example',
    },
  },
}));

function decode(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

describe('Mailer', () => {
  const email = 'player@test.example';
  let fetchMock: jest.SpiedFunction<typeof fetch>;
  let response: Response;

  beforeEach(() => {
    env.mailer.remoteActionKey = 'test-action-key';
    response = new Response(null, { status: 200 });
    fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  function request(index = 0) {
    const [url, options] = fetchMock.mock.calls[index];
    expect(url).toBe('https://mail.test.example/send');
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(URLSearchParams);
    const form = options?.body as URLSearchParams;
    const [to, subject, body, headers, additionalParams] = JSON.parse(
      decode(form.get('data')!)
    ) as [string, string, string, Record<string, string>, string];
    expect(subject).toMatch(/^=\?utf-8\?B\?.+\?=$/);
    const boundary = headers['Content-Type'].match(/boundary="([a-f0-9]{32})"/)![1];
    const parts = body.split(`--${boundary}`);
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('');
    expect(parts[3]).toBe('--');

    function part(partIndex: number, contentType: string) {
      const [partHeaders, content] = parts[partIndex].split('\r\n\r\n');
      expect(partHeaders).toBe(
        `\r\nContent-Type: ${contentType}; charset=UTF-8\r\nContent-Transfer-Encoding: base64`
      );
      const lines = content.trim().split('\n');
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.every((line) => line.length <= 76)).toBe(true);
      return decode(content);
    }

    return {
      form,
      to,
      subject: decode(subject.slice('=?utf-8?B?'.length, -2)),
      headers,
      additionalParams,
      boundary,
      text: part(1, 'text/plain'),
      html: part(2, 'text/html'),
    };
  }

  it.each([
    {
      name: 'already registered notice',
      send: () => sendAlreadyRegisteredMail(email),
      subject: 'Pantheon: your email is already registered',
      content: 'attempted to register an email that we already have in our database',
    },
    {
      name: 'sign-up confirmation',
      send: () => sendSignupMail(email, '/profile/confirmRegistration/test-token'),
      subject: 'Pantheon: confirm your registration',
      content: 'https://pantheon.test.example/profile/confirmRegistration/test-token',
    },
    {
      name: 'password recovery',
      send: () => sendPasswordRecovery('approval-token', email),
      subject: 'Pantheon: password recovery request',
      content:
        'https://pantheon.test.example/profile/resetPasswordConfirm/' +
        Buffer.from(`approval-token@@@${email}`, 'utf8').toString('base64'),
    },
  ])('sends the $name to the mail service', async ({ send, subject, content }) => {
    await expect(send()).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const mail = request();
    expect(mail.form.get('actionkey')).toBe('test-action-key');
    expect(mail.to).toBe(email);
    expect(mail.subject).toBe(subject);
    expect(mail.text).toContain(content);
    expect(mail.html).toContain(content);
    expect(mail.headers).toEqual({
      'MIME-Version': '1.0',
      'List-Unsubscribe': 'noreply@test.example',
      'X-Mailer': 'PantheonNotifier/2.0',
      'Content-Type': `multipart/alternative; boundary="${mail.boundary}"`,
    });
    expect(mail.additionalParams).toBe('-F "Pantheon mail service" -f noreply@test.example');
  });

  it('preserves UTF-8 text and formats links and line breaks in the HTML alternative', async () => {
    const link = 'https://pantheon.test.example/profile/confirmRegistration/токен';
    await sendSignupMail('игрок@test.example', '/profile/confirmRegistration/токен');

    const mail = request();
    expect(mail.to).toBe('игрок@test.example');
    expect(mail.text).toContain(link);
    expect(mail.text).toContain('\n');
    expect(mail.text).not.toContain('<a');
    expect(mail.html).toContain("<meta charset='UTF-8'>");
    expect(mail.html).toContain(`<title>${mail.subject}</title>`);
    expect(mail.html).toContain(`<a href="${link}">${link}</a>`);
    expect(mail.html).toContain('Hello!<br /><br />');
    expect(mail.html).not.toContain('\n');
  });

  it('sends an empty action key when none is configured', async () => {
    env.mailer.remoteActionKey = undefined;

    await sendAlreadyRegisteredMail(email);

    expect(request().form.get('actionkey')).toBe('');
  });

  it('generates separate MIME boundaries for successive messages', async () => {
    await sendAlreadyRegisteredMail(email);
    await sendAlreadyRegisteredMail(email);

    expect(request(0).boundary).not.toBe(request(1).boundary);
  });

  it('logs and propagates a mail service connection failure', async () => {
    const error = new Error('Mail service unavailable');
    fetchMock.mockRejectedValue(error);
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(sendSignupMail(email, '/profile/confirmRegistration/token')).rejects.toBe(error);
      expect(errorLog).toHaveBeenCalledWith(error);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      errorLog.mockRestore();
    }
  });
});
