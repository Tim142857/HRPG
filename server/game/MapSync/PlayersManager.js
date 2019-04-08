'use strict';

let Sequelize = require('sequelize');
const Op = Sequelize.Op;
var ArrayUtils = require('../../utils/Arrays');
var { User } = require('../../models');

var listPlayers = [];

function getPlayersList(){
  return User.findAll(
    { where: { inGame: true } }
  )
}

function addPlayer(user){
  listPlayers.push(user);
}

function removePlayerById(id){
  return User.update(
    { socketId: null },
    { where: { id } }
  )
  // listPlayers = ArrayUtils.removeElementById(listPlayers, playerId);
}

function getPlayerById(id){
  return User.findByPk(id);
  // return ArrayUtils.getObjectInArrayById(listPlayers, id);
}

function getPlayerBySocketId(socketId){
  return User.findOne({ where: { socketId } })
}

// function getPlayersList(){
//   return listPlayers;
// }

// function addPlayer(playerInfo){
//   listPlayers.push(playerInfo);
// }
//
// function removePlayerById(playerId){
//   listPlayers = ArrayUtils.removeElementById(listPlayers, playerId);
// }
//
// function getPlayerById(id){
//   return ArrayUtils.getObjectInArrayById(listPlayers, id);
// }


module.exports = {
  getPlayersList: getPlayersList,
  addPlayer: addPlayer,
  removePlayerById: removePlayerById,
  getPlayerById: getPlayerById,
  getPlayerBySocketId: getPlayerBySocketId
};
