const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/AuthController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/register-acheteur", authCtrl.registerAcheteur);
router.get("/me", requireAuth, authCtrl.getMe);
router.put("/me", requireAuth, authCtrl.updateMe);
router.put("/me/password", requireAuth, authCtrl.changePassword);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);
router.post("/verify-email", authCtrl.verifyEmail);
router.post("/resend-verification", authCtrl.resendVerification);

module.exports = router;
