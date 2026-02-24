const express = require("express");
const router = express.Router();
const ShopCtrl = require("../../controllers/shop/ShopController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

// Routes publiques (pas d'auth)
router.get("/top", ShopCtrl.getTopShops);
router.get("/active", ShopCtrl.getActiveShops);
router.get("/:id", ShopCtrl.getShopById);

// Routes protégées
router.use(requireAuth);

router.post("/", requireRole("ADMIN"), ShopCtrl.createShop);
router.post("/boutique/owner", requireRole("ADMIN"), ShopCtrl.createShopWithProprietaire);
router.get("/", ShopCtrl.getShops);
router.put("/:id", requireRole("ADMIN", "BOUTIQUE"), ShopCtrl.updateShop);
router.delete("/:id", requireRole("ADMIN"), ShopCtrl.deleteShop);
router.post("/:id/suspensions", requireRole("ADMIN"), ShopCtrl.addSuspension);
router.post("/upload/logo", requireRole("ADMIN", "BOUTIQUE"), ShopCtrl.uploadShopLogo);
router.post("/upload/banner", requireRole("ADMIN", "BOUTIQUE"), ShopCtrl.uploadShopBanner);
router.put("/shop/status", ShopCtrl.updateShopStatus);
router.get("/shop/owner", ShopCtrl.getShopByIdOwner);
module.exports = router;
