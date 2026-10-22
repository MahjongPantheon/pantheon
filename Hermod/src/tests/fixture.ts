export const plainText =
  'Hello, 世界!\nConfirm: https://example.invalid/profile/confirm/test-code\n';
export const htmlText =
  '<html><body>Hello, 世界! <a href="https://example.invalid">Confirm</a></body></html>';
export const subject = '=?utf-8?B?' + Buffer.from('Confirm your account').toString('base64') + '?=';
export const boundary = '0123456789abcdef0123456789abcdef';
export const body = `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(plainText).toString('base64')}\r\n--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(htmlText).toString('base64')}\r\n--${boundary}--`;
export const headers = {
  'MIME-Version': '1.0',
  'Content-Type': `multipart/alternative; boundary="${boundary}"`,
  'X-Mailer': 'PantheonNotifier/2.0',
};
export const payload = [
  'recipient@example.invalid',
  subject,
  body,
  headers,
  '-F "Pantheon mail service" -f sender@example.invalid',
];
export const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
