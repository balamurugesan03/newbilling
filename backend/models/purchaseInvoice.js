// models/purchaseInvoice.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemCode: String,
  productName: String,
  hsnSac: String,
  quantity: Number,
  rate: Number,
  discount: Number,
  total: Number,
});

const purchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  supplierName: String,
  purchaseDate: Date,
  items: [itemSchema],
  totalAmount: Number,
}, { timestamps: true });

module.exports = mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
