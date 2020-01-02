'use strict';

const faker = require('faker')
var payStatus = ["paid", "unpaid", "cancel"]
var shipStatus = ["stock", "on the way", "arrived"]

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Orders',
      Array.from({ length: 30 }).map((item, index) => ({
        name: faker.commerce.productName(),
        phone: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        amount: faker.random.number(),
        cost: faker.random.number(),
        sn: faker.random.number(),
        shipping_status: Math.floor(Math.random() * 1),
        payment_status: Math.floor(Math.random() * 1),
        // shipping_status: shipStatus[Math.floor(Math.random() * shipStatus.length)],
        // payment_status: payStatus[Math.floor(Math.random() * payStatus.length)],
        UserId: Math.floor(Math.random() * (4 - 2)) + 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      ), {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Orders', null, {})
  }
};
