'use strict';

var DomHelper = require('client/utils/DomHelper');
var scoreList;
var conf = require('../conf')


function init(){
  var scoreContainer = DomHelper.createElement('div', 'game-scoreboard');
  scoreContainer.style.left = (DomHelper.getX(conf.game.width) + 2) + 'px';
  scoreContainer.style.top = DomHelper.getY(0) + 'px';

  var title = document.createElement('h3');
  title.innerHTML = 'Scores';

  scoreList = DomHelper.createElement('ul', 'game-scorelist');

  scoreContainer.appendChild(title);
  scoreContainer.appendChild(scoreList);

  DomHelper.addToContainer(scoreContainer);
}

function setScores(usersList){
  // empty the list
  while (scoreList.firstChild) {
    scoreList.removeChild(scoreList.firstChild);
  }

  usersList.sort(orderByScore)
  .forEach(addScoreElement);

  function orderByScore(a, b) {
    return parseFloat(b.gold) - parseFloat(a.gold);
  }
  function addScoreElement(user){
    var listElement = document.createElement('li');
    listElement.innerHTML = '<strong>' + user.name + '</strong>' + ' : ' + user.gold;

    scoreList.appendChild(listElement);
  }
}

module.exports = {
  init: init,
  setScores: setScores
};
