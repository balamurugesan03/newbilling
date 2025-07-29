const express = require('express');
const router = express.Router();
const { addPurchase, getPurchases,updatePurchase,deletePurchase } = require('../controllers/purchaseController');

// Routes
router.post('/add', addPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

router.get('/', getPurchases);

module.exports = router;
