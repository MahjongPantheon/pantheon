import { base64encode, chunks, md5 } from './crypto';
import { v4 } from 'uuid';
import { env } from './env';

async function _send(
  to: string,
  subject: string,
  message: string,
  headers: Record<string, string>,
  additionalParams: string
) {
  const boundary = md5(v4() + Date.now().toString());
  const additionalHeaders = {
    ...headers,
    'Content-Type': 'multipart/alternative; boundary="' + boundary + '"',
  };

  const content = message
    .replace(/https:\/\/(\S+)/gi, '<a href="$0">$0</a>')
    .replaceAll('\n', '<br />');
  const htmlContent = `<html><head><meta charset='UTF-8'><title>${subject}</title></head><body>${content}</body></html>`;
  const chunkedContent = chunks(base64encode(message));
  const chunkedHtmlContent = chunks(base64encode(htmlContent));
  const subj = '=?utf-8?B?' + base64encode(subject) + '?=';

  const body =
    `--${boundary}\r\n` +
    'Content-Type: text/plain; charset=UTF-8\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    chunkedContent.join('\n') +
    '\r\n' +
    `--${boundary}\r\n` +
    'Content-Type: text/html; charset=UTF-8\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    chunkedHtmlContent.join('\n') +
    '\r\n' +
    `--${boundary}--`;

  return fetch(env.mailer.remoteUrl, {
    method: 'POST',
    body: new URLSearchParams({
      actionkey: env.mailer.remoteActionKey ?? '',
      data: base64encode(JSON.stringify([to, subj, body, additionalHeaders, additionalParams])),
    }),
  }).catch((err) => {
    console.error(err);
    throw err;
  });
}

export async function sendAlreadyRegisteredMail(signupEmail: string) {
  return _send(
    signupEmail,
    'Pantheon: your email is already registered',
    `Hello!

  You (or someone else) had just attempted to register an email that we already have in our database.

  If it was you, please login to the system instead. You can use password recovery if you can't remember your password.

  If it wasn't you, you may safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `,
    {
      'MIME-Version': '1.0',
      'List-Unsubscribe': env.mailer.mailerAddr,
      'X-Mailer': 'PantheonNotifier/2.0',
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}

export async function sendSignupMail(signupEmail: string, regLink: string) {
  return _send(
    signupEmail,
    'Pantheon: confirm your registration',
    `Hello!

  You have just registered your account in the Pantheon system,
  please follow next link to confirm your registration:

  ${env.mailer.guiUrl + regLink}

  If you didn't attempt to register, you can safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `,
    {
      'MIME-Version': '1.0',
      'List-Unsubscribe': env.mailer.mailerAddr,
      'X-Mailer': 'PantheonNotifier/2.0',
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}

export async function sendPasswordRecovery(approvalToken: string, emailSanitized: string) {
  const link =
    env.mailer.guiUrl +
    '/profile/resetPasswordConfirm/' +
    base64encode(approvalToken + '@@@' + emailSanitized);
  const message = `Hello!

  You have just requested password recovery for your account
in the Pantheon system. Please follow next link to reset your password:

  ${link}

  If you didn't attempt to recover password, you can safely ignore this message.

  Sincerely yours,
  Pantheon support team
  `;

  return _send(
    emailSanitized,
    'Pantheon: password recovery request',
    message,
    {
      'MIME-Version': '1.0',
      'List-Unsubscribe': env.mailer.mailerAddr,
      'X-Mailer': 'PantheonNotifier/2.0',
    },
    '-F "Pantheon mail service" -f ' + env.mailer.mailerAddr
  );
}
