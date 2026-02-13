const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/ProductCategoryController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);
router.get("/", ctrl.getProductCategories);
router.get("/:id", ctrl.getProductCategoryById);


router.post("/", requireRole("ADMIN"), ctrl.createProductCategory);
router.put("/:id", requireRole("ADMIN"), ctrl.updateProductCategory);
router.delete("/:id", requireRole("ADMIN"), ctrl.deleteProductCategory);

module.exports = router;
