import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';

export const LAST_MAIL_PATH = '/tmp/last_sent_mail';
export const TEXT_LABEL = '--------------- Text content ----------------\n';
export const HTML_LABEL = '--------------- HTML content ----------------\n';

export class InvalidMail extends Error {}

export interface Mail {
  to: string;
  subject: string;
  body: string;
  headers: Record<string, string>;
  args: string[];
}

function sendmailArgs(params: string): string[] {
  const value = params.trim();
  if (/[\r\n\0]/.test(value)) {
    throw new InvalidMail('Invalid sendmail parameters');
  }
  const args: string[] = [];
  const pattern = /\s*-([fF])\s+(?:"([^"\r\n]*)"|'([^'\r\n]*)'|([^\s"'\r\n]+))/gy;
  while (pattern.lastIndex < value.length) {
    const match = pattern.exec(value);
    if (!match) {
      throw new InvalidMail('Invalid sendmail parameters');
    }
    args.push(`-${match[1]}`, match[2] ?? match[3] ?? match[4]);
  }
  return args;
}

export function decodeMail(data: string): Mail {
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
  } catch {
    throw new InvalidMail('Invalid mail data');
  }
  if (!Array.isArray(payload) || payload.length < 4 || payload.length > 5) {
    throw new InvalidMail('Invalid mail data');
  }
  const [to, subject, body, headers, params = ''] = payload;
  if (
    typeof to !== 'string' ||
    !to ||
    /[\r\n\0]/.test(to) ||
    typeof subject !== 'string' ||
    /[\r\n\0]/.test(subject) ||
    typeof body !== 'string' ||
    !headers ||
    typeof headers !== 'object' ||
    Array.isArray(headers) ||
    typeof params !== 'string'
  ) {
    throw new InvalidMail('Invalid mail data');
  }
  const validatedHeaders: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (
      !/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name) ||
      typeof value !== 'string' ||
      /[\r\n\0]/.test(value)
    ) {
      throw new InvalidMail('Invalid mail headers');
    }
    validatedHeaders[name] = value;
  }
  return { to, subject, body, headers: validatedHeaders, args: sendmailArgs(params) };
}

export async function submitMail(mail: Mail, executable = '/usr/sbin/sendmail'): Promise<void> {
  const headers = Object.entries({ To: mail.to, Subject: mail.subject, ...mail.headers })
    .map(([name, value]) => `${name}: ${value}`)
    .join('\r\n');
  const message = `${headers}\r\n\r\n${mail.body}`;
  await new Promise<void>((resolve, reject) => {
    // Pass argv directly. Never interpret the caller's additional parameters in a shell.
    const child = spawn(executable, ['-t', '-i', ...mail.args], { timeout: 30_000 });
    child.on('error', reject);
    child.stdin.on('error', reject);
    child.stdout.resume();
    child.stderr.resume();
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`sendmail exited with code ${code}`));
      }
    });
    child.stdin.end(message);
  });
}

export async function saveLastMail(body: string, path = LAST_MAIL_PATH): Promise<void> {
  const temporary = `${path}.${randomUUID()}`;
  try {
    await writeFile(temporary, body, { mode: 0o600 });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

export function prettifyMail(body: string): string {
  const normalized = body.replaceAll('\r\n', '\n');
  const boundary = normalized.split('\n')[0];
  const parts = normalized.split(boundary).slice(1);
  let text = '';
  let html = '';
  for (const part of parts) {
    const separator = part.indexOf('\n\n');
    if (separator < 0) {
      continue;
    }
    const headers = part.slice(0, separator);
    const content = part.slice(separator + 2).trim();
    const decoded = /Content-Transfer-Encoding:\s*base64/i.test(headers)
      ? Buffer.from(content, 'base64').toString('utf8')
      : content;
    if (/Content-Type:\s*text\/plain\b/i.test(headers)) {
      text = decoded;
    }
    if (/Content-Type:\s*text\/html\b/i.test(headers)) {
      html = decoded;
    }
  }
  return TEXT_LABEL + text + HTML_LABEL + html;
}

export async function dumpLastMail(path = LAST_MAIL_PATH): Promise<string> {
  try {
    return prettifyMail(await readFile(path, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}
