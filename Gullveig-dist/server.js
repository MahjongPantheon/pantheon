// Replaced by the service's production build.
import('node:http').then((http) => {
  const port = Number(process.env.PORT ?? '41091');
  const server = http.createServer((_request, response) => {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Gullveig is not built yet.\n');
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Gullveig placeholder listening on http://127.0.0.1:${server.address().port}`);
    console.log('Run make prod_build_gullveig to replace this dummy server.');
  });
});
