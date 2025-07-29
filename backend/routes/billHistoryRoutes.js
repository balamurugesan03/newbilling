const express = require("express");
const router = express.Router();
const { getBillsByDateRange } = require("../controllers/billHistoryController");

// Route: GET /api/bill-history?start=...&end=...
router.get("/", getBillsByDateRange);

module.exports = router;
