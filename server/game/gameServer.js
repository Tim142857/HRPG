// game server : handle socket communication related to the game mechanics

var mapDataServer = require('./MapSync/mapDataServer');
var playersManager = require('./MapSync/PlayersManager');
var { UserManager } = require('../managers');


var socketIO;
var NICKNAME_MAX_LENGTH = 16;
var MESSAGE_MAX_LENGTH = 100;

var GameServer = function(io){
  socketIO = io;
  mapDataServer.setServerSocket(socketIO);
  return {
    start: function(){
      mapDataServer.init();
      socketIO.on('connection', onClientConnected);

    }
  };
};

function onClientConnected(client){
  client.on('CLIENT_REQUEST_ID', onRequestId);
  client.on('CLIENT_NOTIFY_PLAYER_MOVEMENT', onNotifyPlayerMovement);
  client.on('CLIENT_REQUEST_PLAYER_LIST', onRequestPlayerList);
  client.on('CLIENT_CHAT_MESSAGE', onChatMessage);

  client.on('disconnect', onDisconnected);

  mapDataServer.synchronizeClient(client);

  function onRequestId(logs) {

    // limit nickname size, and escape special characters
    let name = filterInput(logs.name, NICKNAME_MAX_LENGTH);

    UserManager.findOrCreate(name, client.id)
    .then(user => {
      client.emit('SERVER_PLAYER_ID', user);

      // respond the connected player with his ID
      // client.emit('SERVER_PLAYER_ID', client.id);
      // client.emit('SERVER_PLAYER_ID', user.socketId);

      // notify all the other players that a new player is connected
      // notifyConnectedPlayer(client, playerInfo);
      notifyConnectedPlayer(client, user);
    })


  }

  function notifyConnectedPlayer(client, user){
    // playersManager.addPlayer(user);
    client.broadcast.emit('SERVER_PLAYER_CONNECTED', user);
  }

  async function onNotifyPlayerMovement(movementInfo){
    client.broadcast.emit('SERVER_OTHER_PLAYER_MOVED', movementInfo);

    // update state on server
    var concernedPlayer = await playersManager.getPlayerById(movementInfo.user.id);

    if(concernedPlayer){
      concernedPlayer.coordX = movementInfo.x;
      concernedPlayer.coordY = movementInfo.y;
    }
  }

  async function onRequestPlayerList(){
    let playersList = await playersManager.getPlayersList();
    client.emit('SERVER_PLAYER_LIST', playersList);
  }

  function onDisconnected(){
    playersManager.removePlayerById(client.id)
    .then(async(user) => {
      let playersList = await playersManager.getPlayersList();
      client.broadcast.emit('SERVER_PLAYER_LIST', playersList);
    })
  }


  function onChatMessage(chatMessageInfo){
    chatMessageInfo.nickname = filterInput(chatMessageInfo.nickname, NICKNAME_MAX_LENGTH);
    chatMessageInfo.text = filterInput(chatMessageInfo.text, MESSAGE_MAX_LENGTH);

    client.broadcast.emit('SERVER_PLAYER_CHAT_MESSAGE', chatMessageInfo);
  }
}

// basic security check
function filterInput(input, maxLength){
  if(input.length > maxLength){
    input = input.substring(0,maxLength);
  }
  return input
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
}


module.exports = GameServer;
