'use strict';

var conf = require('../conf')
var ChatManager = require('client/managers/ChatManager');
var DomHelper = require('client/utils/DomHelper');
var nickNameInput, passwordInput;
var domToRemove = [];


function Login(){}


Login.prototype = {

  create: function(){
    this.game.stage.backgroundColor = 0x66990D;

    DomHelper.init(this.game);
    domToRemove = [];
    this.showLoginPanel();
  },
  showLoginPanel: function(){
    let panelWidth, panelHeight;
    panelWidth = 400;
    panelHeight = 200;

    let posX, posY;
    posX = conf.game.width/2 - panelWidth / 2;
    posY = conf.game.height/2 - panelHeight / 2;

    var me = this;
    var panel = DomHelper.mediumPanel(posX, posY, 'game-login-panel');
    var form = DomHelper.form(saveName);
    var blockInput = DomHelper.inputBlock();

    nickNameInput = DomHelper.inputWithLabel(blockInput, 'Enter your name', 200, 200);
    passwordInput = DomHelper.inputWithLabel(blockInput, 'Enter your password', 200, 200);

    var saveButton = DomHelper.createButton('GO !!', 'game-login-button');

    form.appendChild(blockInput);
    form.appendChild(saveButton);
    panel.appendChild(form);

    domToRemove.push(panel); // removing the panel will remove all its childs

    function saveName(){
      me.game.mainPlayerName = ChatManager.setMainPlayerName(nickNameInput.value);
      if(me.game.mainPlayerName){
        $.ajax({
          url : '/login',
          type : 'POST',
          dataType : 'json', // On désire recevoir du HTML,
          data : 'name=' + nickNameInput.value + '&password=' + passwordInput.value,
          success : function(user){ // code_html contient le HTML renvoyé
            me.game.mainPlayer = {};
            me.game.mainPlayer.user = user;

            me.cleanDom();
            me.game.state.start('play');
          }
        });

      }
      nickNameInput.value = '';
    }
  },

  cleanDom: function(){
    for(var i = 0, max = domToRemove.length; i < max; i++){
      domToRemove[i].remove();
    }
  }
};

module.exports = Login;
