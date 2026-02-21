const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/billing/BillingDocumentController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/order/:orderId/invoice", ctrl.downloadInvoice);
router.get("/order/:orderId/receipt", ctrl.downloadReceipt);

module.exports = router;
