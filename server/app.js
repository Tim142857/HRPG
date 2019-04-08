'use strict';
require('rootPath')();
var express    = require('express');
var http       = require('http');
var logger     = require('morgan');
var Path       = require('path');
var Models = require('./models')
var bodyParser = require('body-parser')
var GameServer = require('./game/gameServer');
var { UserManager } = require('./managers')


//keep dat fonction, needed for brunch watch/restart
exports.startServer = function startServer(port, path, callback) {

  var app = express();

  var httpServer = http.createServer(app);
  var io = require('socket.io')(httpServer);
  var gameServer = GameServer(io);

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  app.use(express.static(Path.join(__dirname + "/../" + path)));

  app.use(logger('dev'));

  app.get('/', function(req, res){
    res.sendFile('index.html');
  });
  app.post('/login', function(req, res){
    UserManager.findOrCreate(req.body.name, req.body.password)
    .then(user => {
      res.send(user);
    })
  });

  gameServer.start();
  httpServer.listen(port, callback);
};
