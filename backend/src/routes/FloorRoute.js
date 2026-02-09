const express = require("express");
const router = express.Router();
const FloorCtrl = require("../controllers/FloorController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), FloorCtrl.createFloor);
router.get("/", FloorCtrl.getFloors);
router.get("/:id", FloorCtrl.getFloorById);
router.put("/:id", requireRole("ADMIN"), FloorCtrl.updateFloor);
router.delete("/:id", requireRole("ADMIN"), FloorCtrl.deleteFloor);

module.exports = router;
