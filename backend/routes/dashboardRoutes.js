const express = require("express");
const router = express.Router();
const { getTodayDashboard } = require("../controllers/dashboardController");

router.get("/today", getTodayDashboard);

module.exports = router;
