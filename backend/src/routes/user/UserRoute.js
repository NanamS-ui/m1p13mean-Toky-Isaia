const express = require("express");
const router = express.Router();
const userCtrl = require("../../controllers/user/UserController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth, requireRole("ADMIN"));

router.post("/", userCtrl.createUser);
router.get("/export/excel", userCtrl.exportUsersExcel);
router.get("/user/proprietaire", userCtrl.getProprietaire);
router.get("/", userCtrl.getUsers);
router.get("/gestion/admin", userCtrl.getUsersPourGestionAdmin);
router.get("/:id", userCtrl.getUserById);
router.put("/:id", userCtrl.updateUser);
router.delete("/:id", userCtrl.deleteUser);
router.get("/:id/suspensions", userCtrl.getUserSuspensions);
router.put("/user/reactive", userCtrl.reactiverUser);
router.post("/:id/suspensions", userCtrl.addUserSuspension);
router.get("/:id/login-history", userCtrl.getUserLoginHistory);
router.post("/:id/login-history", userCtrl.addUserLoginHistory);

module.exports = router;
