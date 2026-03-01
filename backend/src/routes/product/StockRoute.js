const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/StockController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/catalog", ctrl.getCatalog);
router.get("/", ctrl.getStocks);
router.get("/:id", ctrl.getStockById);

router.post(
  "/",
  requireRole("ADMIN", "BOUTIQUE"),
  ctrl.createStock
);

router.put("/:id",requireRole("ADMIN", "BOUTIQUE"),ctrl.updateStock);
router.delete("/:id",requireRole("ADMIN", "BOUTIQUE"),ctrl.deleteStock);
router.get("/stock/owner",requireRole("ADMIN", "BOUTIQUE"),ctrl.getStockByOwner);
router.get("/stock/view/:id",requireRole("ADMIN", "BOUTIQUE"),ctrl.getStockViewById);

module.exports = router;
