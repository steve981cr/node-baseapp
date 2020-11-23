'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'SET NULL'
      })
    }
  };
  Article.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};
