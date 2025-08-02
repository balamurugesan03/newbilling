const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Purchase = sequelize.define('Purchase', {
  type: DataTypes.STRING,
  group: DataTypes.STRING,
  brand: DataTypes.STRING,
  itemCode: DataTypes.STRING,
  productName: DataTypes.STRING,
  unit: DataTypes.STRING,
  openingStock: DataTypes.FLOAT,
  openingStockValue: DataTypes.FLOAT,
  purchasePrice: DataTypes.FLOAT,
  salePrice: DataTypes.FLOAT,
  minSalePrice: DataTypes.FLOAT,
  mrp: DataTypes.FLOAT,
  hsnSac: DataTypes.STRING,
  gstRate: DataTypes.FLOAT,
  saleDiscount: DataTypes.FLOAT,
  reorderLevel: DataTypes.FLOAT,
  productionDate: DataTypes.STRING,
  expiryDate: DataTypes.STRING
}, {
  timestamps: true
});

module.exports = Purchase;
