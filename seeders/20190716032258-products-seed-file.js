'use strict';

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Categories',
      ['Grains', 'Vegetables', 'fruit']
        .map((item, index) =>
          ({
            //id: index + 1, 
            name: item,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        ), {})

    return queryInterface.bulkInsert('Products',
      Array.from({ length: 50 }).map((item, index) =>
        ({
          //id: index + 1,
          name: faker.commerce.productName(),
          description: faker.commerce.product() + '/' + faker.commerce.productName(),
          price: Math.round(faker.commerce.price()),
          image: 'https://picsum.photos/200/300',
          createdAt: new Date(),
          updatedAt: new Date(),
          CategoryId: Math.floor(Math.random() * 3) + 1,
          PopulationId: Math.floor(Math.random() * 10) + 1,
          FarmerId: Math.floor(Math.random() * 10) + 1
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Categories', null, {})
    return queryInterface.bulkDelete('Products', null, {})
  }
};
