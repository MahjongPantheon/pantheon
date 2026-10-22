import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  decodeMail,
  dumpLastMail,
  HTML_LABEL,
  prettifyMail,
  saveLastMail,
  submitMail,
  TEXT_LABEL,
} from './mail.js';
import { body, encoded, headers, htmlText, payload, plainText, subject } from './tests/fixture.js';

let directory: string;
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'hermod-mail-'));
});
afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('mail submission and development dumps', () => {
  it('decodes Frey’s tuple and quoted sendmail parameters', () => {
    expect(decodeMail(encoded)).toEqual({
      to: payload[0],
      subject,
      body,
      headers,
      args: ['-F', 'Pantheon mail service', '-f', 'sender@example.invalid'],
    });
  });

  it('preserves empty optional sendmail parameters', () => {
    const tuple = Buffer.from(JSON.stringify(payload.slice(0, 4))).toString('base64');
    expect(decodeMail(tuple).args).toEqual([]);
  });

  it.each(['invalid', 'null', '{}', '[]'])('rejects malformed mail %s', (value) => {
    expect(() => decodeMail(Buffer.from(value).toString('base64'))).toThrow('Invalid mail data');
  });

  it.each([
    ['recipient\r\nBcc: other@example.invalid', subject, body, headers, ''],
    ['recipient@example.invalid', 'subject\nBcc: other', body, headers, ''],
    ['recipient@example.invalid', subject, body, { 'X-Test': 'value\r\nBcc: other' }, ''],
    ['recipient@example.invalid', subject, body, headers, '-X /tmp/mail-log'],
    [
      'recipient@example.invalid',
      subject,
      body,
      headers,
      '-f sender@example.invalid; touch /tmp/marker',
    ],
  ])('rejects header injection and unsupported options %#', (...tuple) => {
    expect(() => decodeMail(Buffer.from(JSON.stringify(tuple)).toString('base64'))).toThrow();
  });

  it('passes literal argv and MIME bytes to sendmail without a shell', async () => {
    const executable = join(directory, 'fake sendmail');
    const argsPath = join(directory, 'args');
    const messagePath = join(directory, 'message');
    await writeFile(
      executable,
      `#!/bin/sh\nprintf '%s\\n' "$@" > '${argsPath}'\ncat > '${messagePath}'\n`,
      { mode: 0o755 }
    );
    const mail = decodeMail(encoded);
    mail.args = ['-F', '$(touch /tmp/hermod-shell-marker)', '-f', 'sender@example.invalid'];
    await submitMail(mail, executable);
    expect(await readFile(argsPath, 'utf8')).toBe(
      '-t\n-i\n-F\n$(touch /tmp/hermod-shell-marker)\n-f\nsender@example.invalid\n'
    );
    const contents = await readFile(messagePath, 'utf8');
    expect(contents).toContain(`To: recipient@example.invalid\r\nSubject: ${subject}\r\n`);
    expect(contents.endsWith(`\r\n\r\n${body}`)).toBe(true);
  });

  it('reports sendmail process failures', async () => {
    const executable = join(directory, 'failed-sendmail');
    await writeFile(executable, '#!/bin/sh\ncat > /dev/null\nexit 17\n', { mode: 0o755 });
    await expect(submitMail(decodeMail(encoded), executable)).rejects.toThrow(
      'sendmail exited with code 17'
    );
    await expect(submitMail(decodeMail(encoded), join(directory, 'missing'))).rejects.toThrow();
  });

  it('decodes both UTF-8 MIME parts without including the closing boundary', () => {
    expect(prettifyMail(body)).toBe(TEXT_LABEL + plainText + HTML_LABEL + htmlText);
    expect(prettifyMail(body.replaceAll('\r\n', '\n'))).toBe(
      TEXT_LABEL + plainText + HTML_LABEL + htmlText
    );
  });

  it('returns an empty dump before the first mail', async () => {
    expect(await dumpLastMail(join(directory, 'missing-mail'))).toBe('');
  });

  it('atomically retains a complete last mail during concurrent submissions', async () => {
    const cachePath = join(directory, 'last-mail');
    const bodies = Array.from({ length: 12 }, (_, i) => body + `\n${i}`);
    await Promise.all(bodies.map((mailBody) => saveLastMail(mailBody, cachePath)));
    expect(bodies).toContain(await readFile(cachePath, 'utf8'));
    expect((await readdir(directory)).filter((name) => name.startsWith('last-mail.'))).toEqual([]);
  });
});
