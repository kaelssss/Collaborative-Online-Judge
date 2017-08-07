var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var http = require('http');
var sckIO = require('socket.io');
var io = sckIO();

var restRouter = require('./routes/rest.js');
var indexRouter = require('./routes/index.js');
var editorSocketService = require('./services/editorSocketService.js');
editorSocketService.welcome(io);

mongoose.connect('mongodb://user:user@ds041404.mlab.com:41404/cs503-oj-db');

app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use('/api/v1', restRouter);
app.use(function(req, res, next) {
  res.sendFile('index.html', {root: path.join(__dirname, '../public')});
});

var server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  throw error;
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}