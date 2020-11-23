'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Articles', // table name 
      'userId', // new field name
      { 
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        }        
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Articles',  'userId')
  }
};