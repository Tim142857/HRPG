var User = require('../models/User')

module.exports = {
  findOrCreate: (name, socketId) => {
    return User
    .findOrCreate({where: { name }})
    .then(([user, created]) => {
      user.socketId = socketId;
      return user.save()
    })
  }
}
