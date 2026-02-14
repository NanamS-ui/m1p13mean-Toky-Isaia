const express = require("express");
const router = express.Router();
const DoorCtrl = require("../../controllers/shop/DoorController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), DoorCtrl.createDoor);
router.get("/", DoorCtrl.getDoors);
router.get("/:id", DoorCtrl.getDoorById);
router.put("/:id", requireRole("ADMIN"), DoorCtrl.updateDoor);
router.delete("/:id", requireRole("ADMIN"), DoorCtrl.deleteDoor);
router.get("/floor/:idFloor", DoorCtrl.getDoorsByFloor);
router.get("/availablefloor/:idFloor", DoorCtrl.getAvailableDoorsByFloor);

module.exports = router;
