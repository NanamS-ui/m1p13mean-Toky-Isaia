const PaymentService = require("../../services/payment/PaymentService");

exports.createBankPayment = async (req, res) => {
  try {
    const { orderId, bankDetails } = req.body || {};
    if (!orderId) return res.status(400).json({ message: "orderId manquant" });

    const result = await PaymentService.createBankPaymentForOrder({
      orderId,
      userId: req.user.id,
      bankDetails
    });

    return res.status(201).json(result);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Erreur" });
  }
};

exports.getLatestPaymentForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: "orderId manquant" });

    const payment = await PaymentService.getLatestPaymentForOrder({
      orderId,
      userId: req.user.id
    });

    return res.json(payment);
  } catch (error) {
    return res
      .status(error.status || 400)
      .json({ message: error.message || "Erreur" });
  }
};
