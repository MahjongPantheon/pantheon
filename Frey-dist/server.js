import('http').then((http) => {
  const port = parseInt(process.env.PORT ?? '4104');
  const server = http.createServer(() => {
  });
  server.listen(port, 'localhost', () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Dummy server started. Waiting for deps to be installed...');
  });
})
