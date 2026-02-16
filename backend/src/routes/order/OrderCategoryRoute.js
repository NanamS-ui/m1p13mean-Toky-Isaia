const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/order/OrderCategoryController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getOrderCategories);
router.get("/:id", ctrl.getOrderCategoryById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createOrderCategory);
router.put("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateOrderCategory);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteOrderCategory);

module.exports = router;
