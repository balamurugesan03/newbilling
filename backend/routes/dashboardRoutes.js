const express = require("express");
const router = express.Router();
const { getTodayDashboard, getDebugDashboard } = require("../controllers/dashboardController");

router.get("/today", getTodayDashboard);
router.get("/debug", getDebugDashboard);

module.exports = router;
