var PORT = process.env.PORT || 8888;

var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

var mem = {};
var db = require('./db');

var path = require('path');

db.createReadStream()
  .on('data', function (item) {
    mem[item.key] = item.value;
  })
  .on('end', function () {
    console.log('Items loaded into memory');
  });

server.listen(PORT, function () {
  console.log('Listening on port', PORT);
});

app.use(express.static(path.resolve(__dirname, '..', 'client')));

io.on('connection', function (socket) {
  socket.on('create', function (data) {
    io.emit('created', data);
    mem[data.id] = data;
    db.put(data.id, data);
  });

  socket.on('read', function (data, response) {
    response(mem);
  });

  socket.on('update', function (data) {
    io.emit('updated', data);
    mem[data.id] = data;
    db.put(data.id, data);
  });

  socket.on('delete', function (data) {
    io.emit('deleted', data);
    delete mem[data.id];
    db.del(data.id);
  });
});
