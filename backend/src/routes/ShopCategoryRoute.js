const express = require("express");
const router = express.Router();
const ShopCategoryCtrl = require("../controllers/ShopCategoryController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN"), ShopCategoryCtrl.createShopCategory)
router.get("/", ShopCategoryCtrl.getShopCategories);
router.get("/:id", ShopCategoryCtrl.getShopCategoryById);
router.put("/:id", requireRole("ADMIN"), ShopCategoryCtrl.updateShopCategory );
router.delete("/:id", requireRole("ADMIN"), ShopCategoryCtrl.deleteShopCategory);

module.exports = router;