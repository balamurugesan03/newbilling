

const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  date: { type: Date, default: Date.now },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // optional
      product: String,
      qty: Number,
      rate: Number,
      gstPercent: Number,
      gstApplicable: Boolean,
      gstAmount: Number,
      total: Number,
    },
  ],

  subtotal: Number,
  totalGST: Number,
  totalAmount: Number,

    receivedAmount: { type: Number, default: 0 },   // NEW
  balanceAmount: { type: Number, default: 0 },  
  paymentMode: { type: String, enum: ["Cash", "Paytm", "UPI", "Card", "credit"], default: "Cash" }, // ✅ New Field
  // credit related fields
  isCredit: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: true }, // credit → false
  paidDate: Date,
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", billSchema);
