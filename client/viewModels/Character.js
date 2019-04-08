var CharacterSpr = require('client/gameSprites/CharacterSpr');
var Pathfinder = require('client/utils/Pathfinder');
var NetworkManager = require('client/network/NetworkManager');

var collideWithCollectableMapAction;

module.exports = class Character {
  constructor(game, user, isMainPlayer) {
    this.createProperties(game, user, isMainPlayer);
    this.setUpSprite(user, isMainPlayer);
    this.setUpLabel(user);
    this.resetCurrentTweens();

    if(isMainPlayer) this.game.mainPlayer = this;
  };

  createProperties(game, user, isMainPlayer){
    this.user = user;
    this.game = game;
    this.isMainPlayer = isMainPlayer;
    this.moveDuration = 100;
    this.info = {};

    this.currentTweens = [];
    this.moving = false;
    this.tweenInProgress = false;

  };

  setUpLabel(user){
    var style = { font: "16px Arial", fill: "#00000" };
    this.labelName = this.game.add.text(-20, -35, user.name, style);
    this.sprite.addChild(this.labelName);
  }

  setUpSprite(user, isMainPlayer){
    this.sprite = new CharacterSpr(this.game, user.coordX, user.coordY, isMainPlayer);
    this.game.add.existing(this.sprite);
    this.game.mmo_group_characters.add(this.sprite);

    this.sprite.walkDown();
  };

  moveTo(targetX, targetY, pathReadyCallback){
    var me = this;
    if(this.isMainPlayer) {
      NetworkManager.notifyMovement({x: targetX, y: targetY, user: this.user})
    }

    Pathfinder.calculatePath(
      this.sprite.position.x,
      this.sprite.position.y,
      targetX,
      targetY,
      function(path) {
        if (pathReadyCallback !== undefined || typeof pathReadyCallback === "function") {
          pathReadyCallback(path);
        }
        me.onReadyToMove(me, path);
      }
    );
  };

  onReadyToMove(me, listPoints){
    this.resetCurrentTweens();
    this.prepareMovement(listPoints);
    this.moveInPath();
  };

  resetCurrentTweens(){
    var me = this;
    this.currentTweens.map(function(tween){
      me.game.tweens.remove(tween);
    });
    this.currentTweens = [];
    this.moving = false;
    this.sprite.stopAnimation();
  };

  prepareMovement(listPoints){
    listPoints = listPoints || [];
    this.currentTweens = [];
    var me = this;

    listPoints.map(function(point){
      me.currentTweens.push(me.getTweenToCoordinate(point.x, point.y));
    });

  };

  getTweenToCoordinate(x, y){
    var tween = this.game.add.tween(this.sprite.position);

    x = (x * Pathfinder.tileSize) + Pathfinder.tileSize / 2;
    y = (y * Pathfinder.tileSize) + Pathfinder.tileSize / 2;
    tween.to({ x:x, y:y }, this.moveDuration);
    return tween;
  };

  moveInPath() {
    if(this.currentTweens.length === 0){
      return;
    }
    var index = 1, me = this;
    this.moving = true;


    moveToNext(this.currentTweens[index]);


    function moveToNext(tween){

      index ++;
      var nextTween = me.currentTweens[index];
      if(nextTween != null){

        tween.onComplete.add(function(){
          me.tweenInProgress = false;
          moveToNext(nextTween);
        });
      }else{
        // if i am the last tween
        tween.onComplete.add(function(){
          me.onStopMovement();
        });
      }

      tween.start();
      me.faceNextTile(tween);

      me.tweenInProgress = true;
    }
  };

  faceNextTile(tween){

    var isVerticalMovement = tween.properties.y == this.sprite.position.y;

    if(isVerticalMovement) {
      if(tween.properties.x > this.sprite.position.x){
        this.sprite.walkRight();
      } else {
        this.sprite.walkLeft();
      }
    } else {
      if(tween.properties.y > this.sprite.position.y){
        this.sprite.walkDown();
      } else {
        this.sprite.walkUp();
      }

    }
  };

  setOnCollideCollectableMapAction(callback){
    collideWithCollectableMapAction = callback;
  };

  checkCollision(){
    this.sprite.callOnCollideWithCollectableSprite(this.onCollideWithCollectable);
  };

  onCollideWithCollectable(collectableSpr){
    var collectableObj = collectableSpr.collectableObj;

    if(collideWithCollectableMapAction) {
      collideWithCollectableMapAction(collectableObj);
    }
  };

  onStopMovement(){
    this.resetCurrentTweens();

  };

  setPosition(x, y){
    this.sprite.position.x = x;
    this.sprite.position.y = y;
  };

  delete(){
    this.sprite.destroy();
  };

}
