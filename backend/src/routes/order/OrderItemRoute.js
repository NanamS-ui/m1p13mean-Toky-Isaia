const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/order/OrderItemController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getOrderItems);
router.get("/:id", ctrl.getOrderItemById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createOrderItem);
router.put("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateOrderItem);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteOrderItem);

module.exports = router;
