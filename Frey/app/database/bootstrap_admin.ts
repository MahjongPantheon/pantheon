import * as process from 'node:process';
import { bootstrapAdmin } from './actions/bootstrap';

bootstrapAdmin()
  .then((id) => {
    console.log('Created administrator account with id = ', id);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to create administrator', err);
    process.exit(1);
  });
