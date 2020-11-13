'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Articles', [
      {
        title: 'Learn JavaScript',
        content: 'Lorem Ipsum.',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Learn Node.js',
        content: 'Blah blah.',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
       },
       {
        title: 'Learn Express',
        content: 'Yadda yadda.',
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
       }
     ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Articles', null, {});
  }
};
