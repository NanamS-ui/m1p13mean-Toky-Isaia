const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/UserController");

router.post("/", userCtrl.createUser);
router.get("/", userCtrl.getUsers);

module.exports = router;
