const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/PriceController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getPrices);
router.get("/:id", ctrl.getPriceById);

router.post(
  "/",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.createPrice
);

router.put(
  "/:id",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.updatePrice
);

router.delete(
  "/:id",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.deletePrice
);

module.exports = router;
