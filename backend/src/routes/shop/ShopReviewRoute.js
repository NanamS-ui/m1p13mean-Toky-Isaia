const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/shop/ShopReviewController");
const { requireAuth } = require("../../middleware/authMiddleware");


router.use(requireAuth);

router.get("/", ctrl.getShopReviews);
router.get("/:id", ctrl.getShopReviewById);
router.post("/", ctrl.createShopReview);
router.put("/:id", ctrl.updateShopReview);
router.delete("/:id", ctrl.deleteShopReview);
router.get("/boutique/by-owner", ctrl.getShopReviewsByOwner);
router.get("/boutique/by-shop", ctrl.getShopReviewsByShop);
module.exports = router;
