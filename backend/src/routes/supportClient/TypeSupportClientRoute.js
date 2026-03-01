
const express = require("express");
const router = express.Router();
const TypeSupportClientController = require("../../controllers/supportClient/TypeSupportClientController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");
router.use(requireAuth);
router.get("/", TypeSupportClientController.getAll);
router.get("/:id", TypeSupportClientController.getById);
router.post("/", TypeSupportClientController.create);
router.put("/:id", TypeSupportClientController.update);
router.delete("/:id", TypeSupportClientController.delete);

module.exports = router;