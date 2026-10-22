import { createDb } from './db.js';
import { migrate } from './migrations.js';

const db = createDb();
try {
  await migrate(db);
  console.log('Hugin migrations completed');
} finally {
  await db.destroy();
}
