const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/PromotionController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getPromotions);
router.get("/:id", ctrl.getPromotionById);

router.post(
  "/",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.createPromotion
);

router.put(
  "/:id",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.updatePromotion
);

router.delete(
  "/:id",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.deletePromotion
);

module.exports = router;
