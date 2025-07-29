const express = require("express");
const router = express.Router();
const { getYearlyReport } = require("../controllers/yearlyReportController");

router.get("/", getYearlyReport);

module.exports = router;
