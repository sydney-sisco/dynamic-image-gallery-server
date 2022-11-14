require('dotenv').config()
var path = require('path');
var fs = require('fs');
var dir = path.join(__dirname, 'public');
var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
};

const requestListener = function (req, res) {
  // res.writeHead(200);
  // res.end("My first server!");
  var reqpath = req.url.toString().split('?')[0];
  if (req.method !== 'GET') {
    res.statusCode = 501;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Method not implemented');
  }

  var file = path.join(dir, reqpath.replace(/\/$/, '/index.html'));
  if (file.indexOf(dir + path.sep) !== 0) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('Forbidden');
  }

  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);

  s.on('open', function () {
    res.setHeader('Content-Type', type);
    s.pipe(res);
  });

  s.on('error', function () {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 404;
    res.end('Not found');
  });
};

function letsencryptOptions(domain) {
  const path = '/etc/letsencrypt/live/';
  return {
    key: fs.readFileSync(path + domain + '/privkey.pem'),
    cert: fs.readFileSync(path + domain + '/cert.pem'),
    ca: fs.readFileSync(path + domain + '/chain.pem')
  };
}

// https or http based on env
let server;
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  // const options = letsencryptOptions('example.com');
  // https.createServer(options, requestListener).listen(443);

  const options = letsencryptOptions(process.env.HOSTNAME);
  server = require("https").createServer(options, requestListener);

} else {
  const http = require('http');
  http.createServer(requestListener).listen(8080);

  server = require("http").createServer(requestListener);
}

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 4000;

const chokidar = require('chokidar');

// One-liner for current directory
chokidar.watch('./public').on('add', (path) => {
  console.log(path);
  const fileName = path.split('/').pop();
  console.log(fileName);
  io.emit('newImage', fileName); // emit an event to all connected sockets
});

io.on("connection", (socket) => {});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
