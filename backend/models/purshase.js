const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  type: String,
  group: String,
  brand: String,
  itemCode: String,
  productName: String,
  unit: String,
  openingStock: Number,
  openingStockValue: Number,
  purchasePrice: Number,
  salePrice: Number,
  minSalePrice: Number,
  mrp: Number,
  hsnSac: String,
  gstRate: Number,
  saleDiscount: Number,
  reorderLevel: Number,
  productionDate: String,
  expiryDate: String
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
