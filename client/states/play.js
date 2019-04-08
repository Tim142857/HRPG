'use strict';

// var CharacterObj = require('client/gameObjects/CharacterObj');
var CharacterObj = require('client/viewModels/Character');
var Pathfinder = require('client/utils/Pathfinder');
var NetworkManager = require('client/network/NetworkManager');
var ChatManager = require('client/managers/ChatManager');
var MapDataClient = require('client/network/MapDataClient');
var conf = require('client/conf');
var { Character } = require('client/viewModels')

function Play(){}

Play.prototype = {
  create: function(){
    this.game.stage.backgroundColor = 0xFFFFFF;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.initMap();
    this.initPathfinder();
    this.initCursor();
    this.setupSpriteGroups();
    this.addMainPlayer();
    this.configPlayerCollisions();
    this.initChatModule();

    this.connectToServer();

    //INPUTS LISTENER
    this.game.input.mouse.capture = true;
    this.keySpace = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.keySpace.onDown.add(cameraOnPlayer, this);
  },
  setupSpriteGroups: function(){
    this.game.mmo_group_collectables = this.game.add.group();
    this.game.mmo_group_characters = this.game.add.group();
  },
  initMap: function(){
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('tiles', 'tiles');
    this.map.addTilesetImage('collision', 'walkables');

    this.walkableLayer = this.map.createLayer('collision');


    this.map.createLayer('ground');
    this.map.createLayer('obstacles');
    this.map.createLayer('obstacles2');

    this.walkableLayer.resizeWorld();
  },

  initPathfinder: function(){

    Pathfinder.init(this.game,
      this.walkableLayer,
      this.map.layers[3].data, // the layer containing the walkable tiles
      [2017], // ID of the walkable tile ( the green one )
      32
    );
  },

  initCursor: function(){
    this.marker = this.game.add.graphics();
    this.marker.lineStyle(2, 0x000000, 1);
    this.marker.drawRect(0, 0, Pathfinder.tileSize, Pathfinder.tileSize);


    this.game.input.onDown.add(function(pointer, event){
      this.updateCursorPosition();
      if(event.button === conf.input.mouse.RIGHT_CLICK) this.mainPlayer.moveTo(this.marker.x, this.marker.y, function(path){});
    }, this);

  },

  updateCursorPosition: function(){
    this.marker.x = this.walkableLayer.getTileX(this.game.input.activePointer.worldX) * 32;
    this.marker.y = this.walkableLayer.getTileY(this.game.input.activePointer.worldY) * 32;
  },

  addMainPlayer: function(){
    this.game.world.setBounds(0, 0, 20000, 20000);

    var startX = (30 * Pathfinder.tileSize) + (Pathfinder.tileSize / 2);
    var startY = (10 * Pathfinder.tileSize) + (Pathfinder.tileSize / 2);

    this.mainPlayer = new CharacterObj(this.game, this.game.mainPlayer.user, true);

    this.mainPlayer.nickname = this.game.mainPlayerName;


    cameraOnPlayer(this.game, this.mainPlayer)
  },

  configPlayerCollisions: function(){
    var me = this;
    this.mainPlayer.setOnCollideCollectableMapAction(function(collectable) {
      collectable.destroy();
      MapDataClient.tryToCollectForPlayer(collectable, me.game.mainPlayer);
    });
  },

  connectToServer: function(){
    var me = this;
    var serverSocket = NetworkManager.connect(this.game, this.mainPlayer.user.name, 'login');

    NetworkManager.onOtherPlayerConnected(function(user){
      ChatManager.systemMessage('info', user.name + ' is connected');
      me.addOtherPlayer(user);
    });

    // set what to do when the current player receive movement information about another player
    NetworkManager.onOtherPlayerMove(function(movementInfo){
      var otherPlayerToMove = searchById(me.otherPlayers, movementInfo.user.id);
      if(otherPlayerToMove){
        otherPlayerToMove.moveTo(movementInfo.x, movementInfo.y);
      }
    });

    // set what to do when the client receive the players list from the server
    NetworkManager.onUpdatePlayerList(function(receivedList){
      me.removeDisconnected(receivedList);
      me.addConnected(receivedList);

    });
    this.otherPlayers = [];

    this.synchronizeMapData(serverSocket);
  },

  addOtherPlayer: function(user){
    var otherPlayer = new CharacterObj(this.game, user, false);
    // otherPlayer.uid = otherPlayerInfo.uid;
    // otherPlayer.nickname = otherPlayerInfo.nickname;
    this.otherPlayers.push(otherPlayer);
  },

  removeDisconnected: function(usersList){
    //this.othersPlayers containes Characrer objects, usersList containes users objects
    var newOtherPlayers = [];
    for(var i = 0, max = this.otherPlayers.length; i<max; i++){
      var otherPlayer = this.otherPlayers[i];
      // test if the player on this browser is still on the server list
      var playerInList = searchById(usersList, otherPlayer.user.id);

      if(playerInList){
        // keep the player
        newOtherPlayers.push(otherPlayer);
      } else {
        // remove from the game
        otherPlayer.destroy();
        ChatManager.systemMessage('error', otherPlayer.nickname + ' disconnected');
      }
    }
    this.otherPlayers = newOtherPlayers;
  },

  addConnected: function(receivedList){
    // search in the list if an element is not present in the otherPlayers, and not mainPlayer Add it
    for(var i = 0, max = receivedList.length; i<max;i++){
      var receivedPlayer = receivedList[i];
      if(receivedPlayer.id !== this.mainPlayer.user.id){
        var connectedPlayer = searchById(this.otherPlayers, receivedPlayer.id);
        if(!connectedPlayer){
          this.addOtherPlayer(receivedPlayer);
        }
      }

    }
  },

  initChatModule: function(){
    ChatManager.init(this.game.parent);
    var me = this;

    NetworkManager.setOnReceiveChatMessage(function(messageInfo){
      ChatManager.appendMessage(messageInfo.nickname, messageInfo.text);
    });
  },

  synchronizeMapData: function(serverSocket){
    MapDataClient.synchronize(serverSocket, this);
  },

  checkMainPlayerCollision: function() {
    if(this.mainPlayer !== undefined) {
      this.mainPlayer.checkCollision();
    }
  },

  update: function(){
    // this.updateCursorPosition();
    this.checkMainPlayerCollision();

    if (this.game.input.activePointer.isDown && this.game.input.mouse.button === conf.input.mouse.LEFT_CLICK)
    {
      if (this.game.origDragPoint) {
        // move the camera by the amount the mouse has moved since last update
        this.game.camera.x += this.game.origDragPoint.x - this.game.input.activePointer.position.x;
        this.game.camera.y += this.game.origDragPoint.y - this.game.input.activePointer.position.y;
      }
      // set new drag origin to current position
      this.game.origDragPoint = this.game.input.activePointer.position.clone();
    }else{
      this.game.origDragPoint = null;
    }
  }

};


function cameraOnPlayer(game, player){
  game.camera.x = player.sprite.position.x - conf.game.width/2;
  game.camera.y = player.sprite.position.y - conf.game.height/2;
}

function searchById(array, id){

  for(var i = 0, max = array.length; i < max; i++){
    let idToCompare = array[i].user ? array[i].user.id : array[i].id;
    if(idToCompare === id) return array[i];

    // var uid = array[i].getInfo ? array[i].getInfo().uid : array[i].uid;
    // if(array[i] != null && uid === id){
    //   return array[i];
    // }
  }
  return undefined;
}

function removeElementById(array, id){
  return array.filter(function( obj ) {
    return obj.uid !== id;
  });
}


module.exports = Play;
