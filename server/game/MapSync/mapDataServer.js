/*
* Manage Main map Objects
*/

var ArrayUtils = require('../../utils/Arrays');
var playersManager = require('./PlayersManager');
var Gold = require('./Collectable/Gold');
var { User } = require('../../models');

var MapFile = require('../../../client/assets/gameAssets/map/map.json');

var collectableObjects = [];
var serverSocket;

const COLLECTABLE_LAYER_NAME = "s_collectable";

// init the map objects that need to be synchronized
function init(){
  loadCollectablesFromMapFile();

  // Revive the collectables every 20 seconds for demo purpose
  reviveCollectablesPeriodically(20);
}

function loadCollectablesFromMapFile(){
  collectableObjects = [];

  var collectableLayer = MapFile.layers.filter(function( layer ) {
    return layer.name === COLLECTABLE_LAYER_NAME;
  })[0];

  var counter = 0;
  collectableLayer.objects.forEach(function(colObject){
    if(colObject.type === 'Gold'){
      collectableObjects.push(new Gold(counter, colObject.x, colObject.y));
      counter++;
    }
  });

}

function reviveCollectablesPeriodically(nbSeconds){
  setInterval(function(){
    loadCollectablesFromMapFile();
    serverSocket.emit('SERVER_ALL_COLLECTABLES', collectableObjects);
  }, nbSeconds * 1000);
}


function synchronizeClient(client){
  client.on('CLIENT_GET_ALL_COLLECTABLES', onGetAllCollectables);
  client.on('CLIENT_TRY_TO_COLLECT', onClientAskToCollect);


  function onGetAllCollectables() {
    client.emit('SERVER_ALL_COLLECTABLES', collectableObjects);
    sendPlayersScores();
  }

  async function onClientAskToCollect(collisionInfo){
    var targetColectable = ArrayUtils.getObjectInArrayById(collectableObjects, collisionInfo.collectableId);
    if(targetColectable.isAvailable){
      targetColectable.isAvailable = false;
      notifyCollectableDestroy(targetColectable);
      var userUpdated = await addPlayerScore(collisionInfo.playerId, targetColectable.scoreValue)
      sendPlayersScores();
    }
  }

  function addPlayerScore(userId, scoreToAdd){
    // var concernedPlayer = playersManager.getPlayerById(playerId);
    // concernedPlayer.score += scoreToAdd;
    return User.findByPk(userId)
    .then(user => {
      if(user){
        user.gold += scoreToAdd;
        return user.save();
      }
    })
  }

  function notifyCollectableDestroy(collectable){
    client.broadcast.emit('SERVER_COLLECTABLE_DESTROY', collectable);
  }

  async function sendPlayersScores(){
    let playersList = await playersManager.getPlayersList();
    client.server.emit('SERVER_UPDATE_PLAYER_SCORES', playersList);
  }
}


function setServerSocket(socket){
  serverSocket = socket;
}



module.exports = {
  init: init,
  synchronizeClient: synchronizeClient,
  setServerSocket: setServerSocket
};
