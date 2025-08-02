const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PurchaseInvoice = sequelize.define('PurchaseInvoice', {
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  supplierName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = PurchaseInvoice;
