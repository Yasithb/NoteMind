console.log('Starting test server');
import http from 'http';
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({ message: 'Test server is working!' }));
});
server.listen(4000, '0.0.0.0', () => {
  console.log('Server running at http://localhost:4000/');
});
