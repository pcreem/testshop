'use strict';
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Farmers',
      Array.from({ length: 10 }).map((item, index) =>
        ({
          name: faker.internet.userName(),
          tel: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          line: faker.internet.userName(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Farmers', null, {});
  }
};
