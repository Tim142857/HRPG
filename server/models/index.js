const User = require('./User');
const Game = require('./Game');


let Models = {
  User,
  Game
}

//Relations
// Building.belongsTo(TypeBuilding, { as: 'type' });
// Building.belongsTo(User);
// User.hasMany(Building, { as: 'buildings' });
// TypeBuilding.belongsTo(TypeRessource, { as: 'ressource' });
// TypeBuilding.belongsTo(TypeFunctionBuilding, { as: 'functionBuilding' });
// TypeBuilding.belongsTo(TypeSoldier, { as: 'soldier' });
// StockRessource.belongsTo(TypeRessource, { as: 'ressource' });
// StockRessource.belongsTo(User);
// User.hasMany(StockRessource, { as: 'stocks', hooks: true });
// Squad.belongsTo(TypeSoldier);
// Squad.belongsTo(User);
// User.hasMany(Squad, { as: 'squads' });
// Quest.belongsTo(TypeQuest, { as: 'typeQuest' });
// User.hasMany(Hero, { as: 'heroes' })
// Hero.belongsTo(Quest, { as: 'quest' })

module.exports = Models;
