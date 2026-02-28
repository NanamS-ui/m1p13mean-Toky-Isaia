const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/ProductController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getProducts);
router.get("/:id", ctrl.getProductById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createProduct);
router.post("/product/stock", requireRole("ADMIN","BOUTIQUE"), ctrl.createProductStock);
router.post("/upload-image", requireRole("ADMIN","BOUTIQUE"), ctrl.uploadProductImage);
router.put("/product/stock/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateProductByFormulaire);
router.put("/:id", ctrl.updateProduct);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteProduct);

router.get("/favorites/ids/my", requireRole("ACHETEUR"), ctrl.getMyFavoriteProductIds);
router.get("/:id/favorite", requireRole("ACHETEUR"), ctrl.isFavoriteProduct);
router.post("/:id/favorite", requireRole("ACHETEUR"), ctrl.addFavoriteProduct);
router.delete("/:id/favorite", requireRole("ACHETEUR"), ctrl.removeFavoriteProduct);

module.exports = router;
