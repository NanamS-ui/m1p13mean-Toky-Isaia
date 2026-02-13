const express = require("express");
const router = express.Router();
const ShopCtrl = require("../controllers/ShopController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), ShopCtrl.createShop);
router.get("/", ShopCtrl.getShops);
router.get("/:id", ShopCtrl.getShopById);
router.put("/:id", requireRole("ADMIN"), ShopCtrl.updateShop);
router.delete("/:id", requireRole("ADMIN"), ShopCtrl.deleteShop);
router.post("/:id/suspensions", requireRole("ADMIN"), ShopCtrl.addSuspension);
router.post("/upload/logo", requireRole("ADMIN"), ShopCtrl.uploadShopLogo);
router.put("/shop/status", ShopCtrl.updateShopStatus);

module.exports = router;
