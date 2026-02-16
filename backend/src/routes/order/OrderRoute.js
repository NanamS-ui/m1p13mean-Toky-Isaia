const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/order/OrderController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getOrders);
router.get("/:id", ctrl.getOrderById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createOrder);
router.put("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateOrder);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteOrder);

module.exports = router;
