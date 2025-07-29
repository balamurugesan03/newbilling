const express = require("express");
const router = express.Router();
const { createBill, getBills,getMonthlyCreditReport,markBillAsPaid} = require("../controllers/billController");

router.post("/", createBill);
router.get("/", getBills);
router.get("/credit-report", getMonthlyCreditReport);
router.post("/mark-paid/:id", markBillAsPaid);

module.exports = router;
