const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/ProductController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProductById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createProduct);
router.put("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateProduct);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteProduct);

module.exports = router;
