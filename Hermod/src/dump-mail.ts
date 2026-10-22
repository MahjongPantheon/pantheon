import { dumpLastMail } from './mail.js';

process.stdout.write(await dumpLastMail());
