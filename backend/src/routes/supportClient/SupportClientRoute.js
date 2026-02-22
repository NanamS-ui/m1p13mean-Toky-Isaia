const express = require("express");
const router = express.Router();
const SupportClientCtrl = require("../../controllers/supportClient/SupportClientController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), SupportClientCtrl.createSupportClient);
router.get("/", SupportClientCtrl.getSupportClients);
router.get("/:id", SupportClientCtrl.getSupportClientById);
router.put("/:id", requireRole("ADMIN"), SupportClientCtrl.updateSupportClient);
router.delete("/:id", requireRole("ADMIN"), SupportClientCtrl.deleteSupportClient);
router.get("/filter/date", SupportClientCtrl.getSupportClientsByDate);
router.post("/user", SupportClientCtrl.createSupportClientByUser);
module.exports = router;