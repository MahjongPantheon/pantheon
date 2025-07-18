import('http').then((http) => {
  const server = http.createServer(() => {
  });
  server.listen(4104, 'localhost', () => {
    console.log(`Server is running on http://localhost:4104`);
    console.log('Dummy server started. Waiting for deps to be installed...');
  });
})
