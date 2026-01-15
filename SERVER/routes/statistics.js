const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { dailyStats, weeklyStats, summaryStats } = require("../controllers/statsController");

router.get("/daily", verifyToken, dailyStats);
router.get("/weekly", verifyToken, weeklyStats);
router.get("/summary", verifyToken, summaryStats);

module.exports = router;
