const express = require('express');
const router = express.Router();
const {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getInvoiceById
} = require('../controllers/purchaseInvoiceController');

router.post('/add', createPurchaseInvoice);
router.get('/', getAllPurchaseInvoices);
router.get('/:id', getInvoiceById);

module.exports = router;
