const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/AuthController");

router.post("/register-acheteur", authCtrl.registerAcheteur);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);
router.post("/verify-email", authCtrl.verifyEmail);
router.post("/resend-verification", authCtrl.resendVerification);

module.exports = router;
