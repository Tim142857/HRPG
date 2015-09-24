'use stric';

var serverSocket, mainPlayer;
var otherPlayersInfos = [];
var onOtherPlayerConnectedCallback;
var onOtherPlayerMove;
var onUpdatePlayerListCallback;

var networkManager = {
    connected: false,
    connect: function (player) {
        mainPlayer = player;
        serverSocket = io.connect('http://localhost:9192');
        serverSocket.on('connect', onConnectedToServer);
        serverSocket.on('SERVER_PLAYER_ID', onReceivePlayerId);

        serverSocket.on('SERVER_PLAYER_CONNECTED', onPlayerConnected);
        serverSocket.on('SERVER_PLAYER_LIST', onReceivePlayerList);
        serverSocket.on('SERVER_OTHER_PLAYER_MOVED', onOtherPlayerMoved);
    },
    getNextPendingPlayer: function(){
        if(otherPlayersInfos.length > 0){
            otherPlayersInfos.shift();
        }
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
    }

};

function onConnectedToServer() {
    networkManager.connected = true;
    serverSocket.emit('CLIENT_REQUEST_ID', mainPlayer.getInfo());
    serverSocket.emit('CLIENT_REQUEST_PLAYER_LIST');
}

function onReceivePlayerId(mainPlayerID) {
    mainPlayer.uid = mainPlayerID;
    console.log("mon id", mainPlayerID)
}

function onPlayerConnected(otherPlayer){
    console.log('a player is connected', otherPlayer);
    otherPlayersInfos.push(otherPlayer);
    onOtherPlayerConnectedCallback(otherPlayer);
}

function onOtherPlayerMoved(movementInfo){
    onOtherPlayerMove(movementInfo);
}

function onReceivePlayerList(listPlayers){
    onUpdatePlayerListCallback(listPlayers);
}


module.exports = networkManager;