'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Article, {
        foreignKey: 'userId',
      });
    }
  };
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    activationToken: DataTypes.STRING,
    activated: DataTypes.BOOLEAN,
    resetToken: DataTypes.STRING,
    resetSentAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};