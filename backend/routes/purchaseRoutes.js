const express = require('express');
const router = express.Router();
const {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
  syncPurchasesWithProducts,
  getDailyPurchaseReport,
  getPurchaseReportByRange,
  getMonthlyPurchaseSummary
} = require('../controllers/purchaseController');

// Routes
router.post('/add', addPurchase);        // ➕ Add new purchase
router.get('/', getPurchases);           // 📄 Get all purchases
router.put('/:id', updatePurchase);      // ✏️ Update purchase by ID
router.delete('/:id', deletePurchase);   // 🗑️ Delete purchase by ID
router.post('/sync-products', syncPurchasesWithProducts); // 🔄 Sync purchases with products

// Report Routes
router.get('/report/daily', getDailyPurchaseReport);     // 📊 Daily purchase report
router.get('/report/range', getPurchaseReportByRange);   // 📊 Date range purchase report
router.get('/report/monthly', getMonthlyPurchaseSummary); // 📊 Monthly purchase summary

module.exports = router;
