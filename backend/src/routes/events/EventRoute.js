const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/events/EventController");
const { requireAuth, requireRole, optionalAuth } = require("../../middleware/authMiddleware");

// Public: autorise la lecture. Si non authentifié, on forcera published=true dans le controller.
router.get("/", optionalAuth, ctrl.getEvents);
router.get("/:id", optionalAuth, ctrl.getEventById);

// Admin: écriture protégée
router.post("/", requireAuth, requireRole("ADMIN"), ctrl.createEvent);
router.put("/:id", requireAuth, requireRole("ADMIN"), ctrl.updateEvent);
router.delete("/:id", requireAuth, requireRole("ADMIN"), ctrl.deleteEvent);

module.exports = router;
