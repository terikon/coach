'use strict';

const port = 8080;

const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');

console.log(`starting server on port ${port}`);

const httpsOptions = {
  //key: fs.readFileSync('../cert/private.pem'),
  //cert: fs.readFileSync('../cert/certificate.pem')
  pfx: fs.readFileSync('../cert/certificate_combined.pfx')
};

var fileServer = new nodeStatic.Server();
//var app = http.createServer(function (req, res) {
var app = https.createServer(httpsOptions, function (req, res) {
  req.addListener('end', function () {
    if (req.url.endsWith('.vue')) {
      fileServer.serveFile(req.url, 200, { 'Content-Type': 'application/javascript' }, req, res);
    } else {
      fileServer.serve(req, res);
    }
  }).resume();
}).listen(port);

var io = socketIO.listen(app);
io.sockets.on('connection', function (socket) {

  // io.emit - sent to everyone
  // socket.emit - only to socket
  // socket.broadcast.emit - to everyone except socket

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
    console.log([...arguments]);
  }

  socket.on('message', function (message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function (room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients > 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      // io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready', room);
      socket.broadcast.emit('ready', room);
    } else { // max two clients
      //socket.emit('full', room);
    }
  });

  socket.on('ipaddr', function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('disconnect', function (reason) {
    console.log(`Peer or server disconnected. Reason: ${reason}.`);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function (room) {
    console.log(`Peer said bye on room ${room}.`);
  });

  socket.on('player', data => {
    console.log(`player ${data}.`);
    socket.broadcast.emit('player', data);
  });

});
