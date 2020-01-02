'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    image: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,
    PopulationId: DataTypes.INTEGER,
    FarmerId: DataTypes.INTEGER,
    discount: DataTypes.FLOAT
  }, {});
  Product.associate = function (models) {
    // associations can be defined here
    Product.belongsTo(models.Farmer)
    Product.belongsTo(models.Category)
    Product.belongsTo(models.Population)
    Product.belongsToMany(models.Cart, {
      as: 'carts',
      through: {
        model: models.CartItem, unique: false
      },
      foreignKey: 'ProductId'
    });

    Product.belongsToMany(models.Order, {
      through: models.OrderItem,
      foreignKey: 'ProductId',
      as: 'orders'
    });


  };
  return Product;
};