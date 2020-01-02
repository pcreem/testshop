'use strict';
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.bulkInsert('Populations',
      ["Atayal", "Bunun", "Tsou", "Rukai", "Paiwan", "Amis", "Pinuyumayan", "Truku", "Sediq", "Tao"]
        .map((item, index) =>
          ({
            //id: index + 1, 
            population: item,
            name: faker.internet.userName(),
            email: faker.internet.exampleEmail(),
            tel: faker.phone.phoneNumber(),
            address: faker.address.streetAddress(),
            line: faker.commerce.productName(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ), {})

  },

  down: (queryInterface, Sequelize) => {

    return queryInterface.bulkDelete('Populations', null, {});

  }
};