'use strict';
module.exports = (sequelize, DataTypes) => {
  const Population = sequelize.define('Population', {
    population: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    line: DataTypes.STRING
  }, {});
  Population.associate = function (models) {
    // associations can be defined here
    Population.hasMany(models.Product)
  };
  return Population;
};