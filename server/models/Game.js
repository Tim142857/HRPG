let Sequelize = require('sequelize');
let sequelize = require('./config').sequelize;

let Game = sequelize.define('Game', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  }
},
{
  freezeTableName: true,
  timestamps: true,
});

module.exports = Game;
