const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../../middleware/authMiddleware");
const OrderStatisticsController = require("../../controllers/statistic/OrderStatisticsController");

router.use(requireAuth);


router.get("/orders/boutique", OrderStatisticsController.getOrderItemsAnalytics);

module.exports = router;
