const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../../middleware/authMiddleware");
const AdminStatisticController = require("../../controllers/statistic/AdminStatisticController");

router.use(requireAuth);


router.get("/dashboard", requireRole("ADMIN"),AdminStatisticController.getAdminDashboard);
router.get("/statistics", requireRole("ADMIN"),AdminStatisticController.getAdminStatistics);
router.get("/userstatistics", requireRole("ADMIN"),AdminStatisticController.getAdminUserStatistics);

module.exports = router;
