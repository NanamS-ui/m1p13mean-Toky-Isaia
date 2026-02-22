const express = require("express");
const router = express.Router();
const StatusSupportClientCtrl = require("../../controllers/supportClient/StatusSupportClientController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), StatusSupportClientCtrl.createStatusSupportClient);
router.get("/", StatusSupportClientCtrl.getStatusSupportClients);
router.get("/:id", StatusSupportClientCtrl.getStatusSupportClientById);
router.put("/:id", requireRole("ADMIN"), StatusSupportClientCtrl.updateStatusSupportClient);
router.delete("/:id", requireRole("ADMIN"), StatusSupportClientCtrl.deleteStatusSupportClient);

module.exports = router;