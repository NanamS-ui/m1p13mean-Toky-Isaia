const express = require("express");
const router = express.Router();
const FloorCtrl = require("../../controllers/shop/FloorController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

// Route publique pour obtenir les étages
router.get("/", FloorCtrl.getFloors);

// Routes protégées
router.use(requireAuth);

router.post("/", requireRole("ADMIN"), FloorCtrl.createFloor);
router.get("/:id", FloorCtrl.getFloorById);
router.put("/:id", requireRole("ADMIN"), FloorCtrl.updateFloor);
router.delete("/:id", requireRole("ADMIN"), FloorCtrl.deleteFloor);

module.exports = router;
