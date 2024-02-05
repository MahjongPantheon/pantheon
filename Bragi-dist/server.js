import fs from 'node:fs';

import('http').then((http) => {
  const server = http.createServer(() => {
  });
  server.listen(4108, 'localhost', () => {
    console.log(`Server is running on http://localhost:4108`);
    console.log('Dummy server started. Waiting for deps to be installed...');
  });
})
