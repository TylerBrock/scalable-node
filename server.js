const http = require('http');

const response = JSON.stringify({ test: true });

var counter = 0;

const server = http.createServer((req, res) => {
  res.end(response);
  console.log('done', counter++);
});

server.listen(8000, () => {
  console.log('listening...');
});
