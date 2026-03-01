const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/events/EventCategoryController");
const { requireAuth, requireRole, optionalAuth } = require("../../middleware/authMiddleware");

// Public: lecture
router.get("/", optionalAuth, ctrl.getEventCategories);
router.get("/:id", optionalAuth, ctrl.getEventCategoryById);

// Admin: écriture
router.post("/", requireAuth, requireRole("ADMIN"), ctrl.createEventCategory);
router.put("/:id", requireAuth, requireRole("ADMIN"), ctrl.updateEventCategory);
router.delete("/:id", requireAuth, requireRole("ADMIN"), ctrl.deleteEventCategory);

module.exports = router;
