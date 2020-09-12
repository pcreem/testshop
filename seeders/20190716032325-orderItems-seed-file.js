'use strict';

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('OrderItems',
      Array.from({ length: 30 }).map((item, index) =>
        ({
          OrderId: Math.floor(Math.random() * 30) + 1,
          ProductId: Math.floor(Math.random() * 50) + 1,
          price: Math.floor(Math.random() * 500) + 1,
          quantity: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ), {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('OrderItems', null, {})
  }
};