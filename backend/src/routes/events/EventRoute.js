const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/events/EventController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getEvents);
router.get("/:id", ctrl.getEventById);

router.post("/", requireRole("ADMIN"), ctrl.createEvent);
router.put("/:id", requireRole("ADMIN"), ctrl.updateEvent);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteEvent);

module.exports = router;
