let Sequelize = require('sequelize');
let sequelize = require('./config').sequelize;

let User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name:{
    type: Sequelize.STRING,
    required: true
  },
  login: {
    type: Sequelize.STRING,
    required: true
  },
  password: {
    type: Sequelize.STRING,
    required: true
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  ghost: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  coordX: {
    type: Sequelize.INTEGER,
    required: true,
    defaultValue: 120
  },
  coordY: {
    type: Sequelize.INTEGER,
    required: true,
    defaultValue: 120
  },
  socketId: {
    type: Sequelize.STRING,
    required: true
  },
  gold: {
    type: Sequelize.INTEGER,
    required: true,
    defaultValue: 0
  },
  inGame: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
},
{
  freezeTableName: true,
  timestamps: true,
});

module.exports = User;
