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


const server = require("http").createServer(requestListener);
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
