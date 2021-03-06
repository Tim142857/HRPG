'use strict';

var serverSocket, mainPlayer;
var onOtherPlayerConnectedCallback;
var onOtherPlayerMove;
var onUpdatePlayerListCallback;
var onReceiveChatMessageCallback;

var networkManager = {
  connected: false,
  connect: function (game, name, login) {
    serverSocket = game.socketIO;
    // serverSocket.on('connect', function(){
    onConnectedToServer(name, login)
    // });

    this.configureIncomingTraffic();

    return serverSocket;
  },
  configureIncomingTraffic: function(){
    serverSocket.on('SERVER_PLAYER_ID', onreceiveUser);
    serverSocket.on('SERVER_PLAYER_CONNECTED', onPlayerConnected);
    serverSocket.on('SERVER_PLAYER_LIST', onReceivePlayerList);
    serverSocket.on('SERVER_OTHER_PLAYER_MOVED', onOtherPlayerMoved);
    serverSocket.on('SERVER_PLAYER_CHAT_MESSAGE', onReceiveChatMessage);
  },
  onOtherPlayerConnected: function(callback){
    onOtherPlayerConnectedCallback = callback;
  },
  onOtherPlayerMove: function(callback){
    onOtherPlayerMove = callback;
  },
  notifyMovement: function(movementInfo){
    serverSocket.emit('CLIENT_NOTIFY_PLAYER_MOVEMENT', movementInfo);
  },
  onUpdatePlayerList: function(callback){
    onUpdatePlayerListCallback = callback;
  },
  setOnReceiveChatMessage: function(callback){
    onReceiveChatMessageCallback = callback;
  },
  sendChatMessage: function(textMessage){
    serverSocket.emit('CLIENT_CHAT_MESSAGE', {
      uid: mainPlayer.socketId,
      nickname: mainPlayer.name,
      text: textMessage
    });

  }
};

function onConnectedToServer(name, login) {
  networkManager.connected = true;
  serverSocket.emit('CLIENT_REQUEST_ID', { name, login });
  serverSocket.emit('CLIENT_REQUEST_PLAYER_LIST');
}

function onreceiveUser(user) {
  mainPlayer = user;


  // mainPlayer.uid = mainPlayerID;
}

function onPlayerConnected(otherPlayer){
  onOtherPlayerConnectedCallback(otherPlayer);
}

function onOtherPlayerMoved(movementInfo){
  onOtherPlayerMove(movementInfo);
}

function onReceivePlayerList(listPlayers){
  onUpdatePlayerListCallback(listPlayers);
}

function onReceiveChatMessage(messageInfo){
  onReceiveChatMessageCallback(messageInfo);
}

module.exports = networkManager;
