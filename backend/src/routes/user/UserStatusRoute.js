const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/user/UserStatusController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getUserStatuses);
router.get("/:id", ctrl.getUserStatusById);
router.post("/", ctrl.createUserStatus);
router.put("/:id", ctrl.updateUserStatus);
router.delete("/:id", ctrl.deleteUserStatus);

module.exports = router;