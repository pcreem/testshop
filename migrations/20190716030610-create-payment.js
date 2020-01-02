'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.INTEGER
      },
      sn: {
        type: Sequelize.STRING
      },
      payment_method: {
        type: Sequelize.STRING
      },
      paid_at: {
        type: Sequelize.DATE
      },
      params: {
        type: Sequelize.TEXT
      },
      OrderId: {
        type: Sequelize.INTEGER
      }, UserId: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Payments');
  }
};