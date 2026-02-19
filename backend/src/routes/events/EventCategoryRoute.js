const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/events/EventCategoryController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getEventCategories);
router.get("/:id", ctrl.getEventCategoryById);

router.post("/", requireRole("ADMIN"), ctrl.createEventCategory);
router.put("/:id", requireRole("ADMIN"), ctrl.updateEventCategory);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteEventCategory);

module.exports = router;
