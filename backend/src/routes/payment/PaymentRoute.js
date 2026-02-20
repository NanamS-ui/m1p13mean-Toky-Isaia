const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/payment/PaymentController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/order/:orderId", ctrl.getLatestPaymentForOrder);
router.post("/bank", ctrl.createBankPayment);

module.exports = router;
