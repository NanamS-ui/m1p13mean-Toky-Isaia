const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/order/OrderController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getOrders);
router.get("/:id", ctrl.getOrderById);
router.get("/owner/shop", ctrl.getOrderByOwnerId);

router.post("/",  ctrl.createOrder);
router.post("/items", ctrl.createOrderWithItems);
router.put("/:id", ctrl.updateOrder);
router.delete("/:id", ctrl.deleteOrder);

module.exports = router;
