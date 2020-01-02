'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },

      CategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Categories',
          key: 'id'
        }
      },
      PopulationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Populations',
          key: 'id'
        }
      },
      FarmerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Farmers',
          key: 'id'
        }
      },

      discount: {
        type: Sequelize.FLOAT
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Products');
  }
};