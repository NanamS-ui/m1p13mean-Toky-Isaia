const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/StockMouvementController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.post("/", requireRole("ADMIN", "BOUTIQUE"), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/stock/:stockId", ctrl.getByStock);
router.delete("/:id", requireRole("ADMIN"), ctrl.delete);

module.exports = router;
