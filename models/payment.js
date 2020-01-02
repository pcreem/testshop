'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: DataTypes.INTEGER,
    sn: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    paid_at: DataTypes.DATE,
    params: DataTypes.TEXT,
    OrderId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {});
  Payment.associate = function (models) {
    // associations can be defined here
    Payment.belongsTo(models.Order)
    Payment.belongsTo(models.User)
  };
  return Payment;
};