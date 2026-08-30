const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getHomeDashboard } = require("../controllers/dashboardController");

router.get("/home", protect, getHomeDashboard);

module.exports = router;
