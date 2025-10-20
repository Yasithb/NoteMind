console.log('Testing local HTTP server');
import http from 'http';
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World!');
});
server.listen(4000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:4000/');
  // Make a request to our own server
  http.get('http://127.0.0.1:4000/', (res) => {
    console.log('STATUS: ' + res.statusCode);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('RESPONSE: ' + data);
      server.close(() => {
        console.log('Server closed');
      });
    });
  }).on('error', (e) => {
    console.error('Error: ' + e.message);
  });
});
