require('rootpath')();
const Sequelize = require('sequelize');
const dbConf = require('conf/confServer').mySql;
const sequelize = new Sequelize(dbConf.db, dbConf.user, dbConf.password, {
  host: dbConf.host,
  port: dbConf.port,
  dialect: dbConf.dialect,
  operatorsAliases: false,
  pool: dbConf.pool,
  logging: false,
  timezone: '+01:00'
});


sequelize.sync()
.then(() => {
  console.log('############     Synchronisation db ok !    ############');
})
.catch(err => {
  console.log(err);
})



module.exports = {
  sequelize
}
