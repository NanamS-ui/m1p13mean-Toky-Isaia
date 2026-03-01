const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../../middleware/authMiddleware");
const AdminStatisticController = require("../../controllers/statistic/AdminStatisticController");

router.use(requireAuth);


router.get("/dashboard", requireRole("ADMIN"),AdminStatisticController.getAdminDashboard);
router.get("/dashboard/kpi", requireRole("ADMIN"), AdminStatisticController.getDashboardKPI);
router.get("/dashboard/export/excel", requireRole("ADMIN"), AdminStatisticController.exportAdminDashboardExcel);
router.get("/statistics", requireRole("ADMIN"),AdminStatisticController.getAdminStatistics);
router.get("/userstatistics", requireRole("ADMIN"),AdminStatisticController.getAdminUserStatistics);
router.get("/userstatistics/export/excel", requireRole("ADMIN"), AdminStatisticController.exportAdminUserStatisticsExcel);
router.get("/statistics/export/excel", requireRole("ADMIN"), AdminStatisticController.exportAdminStatisticsExcel);

module.exports = router;
