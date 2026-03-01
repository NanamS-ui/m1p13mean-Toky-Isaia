const express = require("express");
const router = express.Router();
const InfoCenterCtrl = require("../../controllers/config/InfoCenterController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.get("/", InfoCenterCtrl.getInfoCenters);
router.get("/:id", InfoCenterCtrl.getInfoCenterById);

router.post("/", requireAuth, requireRole("ADMIN"), InfoCenterCtrl.createInfoCenter);
router.put("/:id", requireAuth, requireRole("ADMIN"), InfoCenterCtrl.updateInfoCenter);
router.delete("/:id", requireAuth, requireRole("ADMIN"), InfoCenterCtrl.deleteInfoCenter);

module.exports = router;
