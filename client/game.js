// "use strict";

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
}, false);

var confClient = require('./conf');

var gameBootstrapper = {
  init: function(gameContainerElementId){

    var game = new Phaser.Game(confClient.game.width, confClient.game.height, Phaser.AUTO, gameContainerElementId);

    game.state.add('boot', require('./states/boot'));
    game.state.add('login', require('./states/login'));
    game.state.add('play', require('./states/play'));

    game.state.start('boot');
  }
};

module.exports = gameBootstrapper;
