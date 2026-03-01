const express = require("express");
const router = express.Router();
const ShopCategoryCtrl = require("../../controllers/shop/ShopCategoryController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

// Routes publiques (pas d'auth)
router.get("/", ShopCategoryCtrl.getShopCategories);
router.get("/:id", ShopCategoryCtrl.getShopCategoryById);

// Routes protégées (auth + admin)
router.use(requireAuth);
router.post("/", requireRole("ADMIN"), ShopCategoryCtrl.createShopCategory);
router.put("/:id", requireRole("ADMIN"), ShopCategoryCtrl.updateShopCategory);
router.delete("/:id", requireRole("ADMIN"), ShopCategoryCtrl.deleteShopCategory);

module.exports = router;