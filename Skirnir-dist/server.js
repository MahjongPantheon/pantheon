import('http').then((http) => {
  const server = http.createServer(() => {
  });
  server.listen(4115, 'localhost', () => {
    console.log(`Server is running on http://localhost:4115`);
    console.log('Dummy server started. Waiting for deps to be installed...');
  });
})
