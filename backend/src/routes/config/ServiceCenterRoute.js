const express = require("express");
const router = express.Router();
const ServiceCenterCtrl = require("../../controllers/config/ServiceCenterController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.get("/", ServiceCenterCtrl.getServiceCenters);
router.get("/:id", ServiceCenterCtrl.getServiceCenterById);

router.post("/", requireAuth, requireRole("ADMIN"), ServiceCenterCtrl.createServiceCenter);
router.put("/:id", requireAuth, requireRole("ADMIN"), ServiceCenterCtrl.updateServiceCenter);
router.delete("/:id", requireAuth, requireRole("ADMIN"), ServiceCenterCtrl.deleteServiceCenter);

module.exports = router;
