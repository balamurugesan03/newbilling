const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  hsCode: {
    type: String,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  purchaseRate: {
    type: Number,
    required: true,
  },
    unitPrice: {
    type: Number,
    required: true,
  },
  gstPercent: {
    type: Number,
    required: true,
  },
  gstApplicable: {
    type: Boolean,
    default: false,
  },
  stockCount: {
    type: Number,
    default: 0,
  },
    discount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Item', itemSchema);
