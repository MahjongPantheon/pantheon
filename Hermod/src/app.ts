import { createServer, type IncomingMessage } from 'node:http';
import {
  decodeMail,
  dumpLastMail,
  InvalidMail,
  LAST_MAIL_PATH,
  saveLastMail,
  submitMail,
  type Mail,
} from './mail.js';

async function readForm(request: IncomingMessage): Promise<URLSearchParams> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > 1024 * 1024) {
      request.resume();
      throw new InvalidMail('Max request size is 1MB');
    }
    chunks.push(buffer);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString('utf8'));
}

export function createApp(options: {
  actionKey: string;
  lastMailPath?: string;
  submit?: (mail: Mail) => Promise<void>;
}) {
  const lastMailPath = options.lastMailPath ?? LAST_MAIL_PATH;
  const submit = options.submit ?? submitMail;
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (request.method !== 'POST') {
      response.writeHead(405, { Allow: 'POST' }).end();
      return;
    }
    try {
      const form = await readForm(request);
      // Keep the existing authentication failure text/status for callers.
      if (!form.get('actionkey') || form.get('actionkey') !== options.actionKey) {
        response.end('Action key check failed');
        return;
      }
      const dump = form.get('dump');
      if (dump !== null && dump !== '' && dump !== '0') {
        response.end(await dumpLastMail(lastMailPath));
        return;
      }
      const mail = decodeMail(form.get('data') ?? '');
      await submit(mail);
      await saveLastMail(mail.body, lastMailPath);
      response.end();
    } catch (error) {
      const invalid = error instanceof InvalidMail;
      if (!invalid) {
        console.error('Mail submission or dump failed', error);
      }
      response.writeHead(invalid ? 400 : 500);
      response.end(invalid ? error.message : 'Unable to process mail');
    }
  });
}
