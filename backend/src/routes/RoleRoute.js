const express = require("express");
const router = express.Router();
const roleCtrl = require("../controllers/RoleController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.use(requireAuth, requireRole("ADMIN"));

router.post("/", roleCtrl.createRole);
router.get("/", roleCtrl.getRoles);
router.get("/:id", roleCtrl.getRoleById);
router.put("/:id", roleCtrl.updateRole);
router.delete("/:id", roleCtrl.deleteRole);

module.exports = router;
