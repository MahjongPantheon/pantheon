import { cleanup } from './actions/cleanup';

cleanup()
  .then(() => {
    console.log('Cleanup complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Cleanup failed', err);
    process.exit(1);
  });
