const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;

const secret = 'my-secret';
const port = 8080;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const signature = req.headers['x-hub-signature'];
      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(body);
      const digest = 'sha1=' + hmac.digest('hex');
      if (signature === digest) {
        console.log('Valid webhook request received');
        exec('docker pull my-nextjs-app && docker run -d -p 3000:3000 my-nextjs-app');
        res.end('Deployment process triggered');
      } else {
        console.log('Invalid webhook request received');
        res.statusCode = 400;
        res.end('Invalid signature');
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
