const buildError = require("../../utils/buildError");

const Payment = require("../../models/payment/Payment");
const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");

const calculateOrderAmountUnits = async (orderId) => {
  const items = await OrderItem.find({ order: orderId, deleted_at: null }).select(
    "unit_price promotion_percentage quantity"
  );

  if (!items.length) {
    const order = await Order.findOne({ _id: orderId, deleted_at: null }).select(
      "total"
    );
    if (!order) throw buildError("Commande introuvable", 404);
    return Number(order.total || 0);
  }

  const total = items.reduce((sum, item) => {
    const unit = Number(item.unit_price || 0);
    const qty = Number(item.quantity || 0);
    const promo = Number(item.promotion_percentage || 0);
    const discounted = unit * (1 - promo / 100);
    return sum + discounted * qty;
  }, 0);

  return total;
};

const createBankPaymentForOrder = async ({ orderId, userId, bankDetails }) => {
  const order = await Order.findOne({ _id: orderId, deleted_at: null }).select(
    "_id buyer"
  );
  if (!order) throw buildError("Commande introuvable", 404);
  if (String(order.buyer) !== String(userId)) {
    throw buildError("Accès interdit à cette commande", 403);
  }

  const amountUnits = await calculateOrderAmountUnits(orderId);
  if (!Number.isFinite(amountUnits) || amountUnits <= 0) {
    throw buildError("Montant de commande invalide", 400);
  }

  const bank_name = bankDetails?.bank_name || bankDetails?.bankName || null;
  const account_holder =
    bankDetails?.account_holder || bankDetails?.accountHolder || null;
  const account_number =
    bankDetails?.account_number || bankDetails?.accountNumber || null;
  const note = bankDetails?.note || null;

  if (!bank_name || !account_holder) {
    throw buildError(
      "Informations bancaires incomplètes (bank_name, account_holder)",
      400
    );
  }

  const payment = await Payment.create({
    provider: "bank_transfer",
    method: "BANK_TRANSFER",
    user: userId,
    order: orderId,
    amount: amountUnits,
    currency: "mga",
    status: "WAITING_CONFIRMATION",
    bank_details: {
      bank_name: String(bank_name).trim(),
      account_holder: String(account_holder).trim(),
      account_number: account_number ? String(account_number).trim() : null,
      note: note ? String(note).trim() : null
    }
  });

  return { payment };
};

const getLatestPaymentForOrder = async ({ orderId, userId }) => {
  const order = await Order.findOne({ _id: orderId, deleted_at: null }).select(
    "_id buyer"
  );
  if (!order) throw buildError("Commande introuvable", 404);
  if (String(order.buyer) !== String(userId)) {
    throw buildError("Accès interdit à cette commande", 403);
  }

  const payment = await Payment.findOne({
    order: orderId,
    user: userId,
    deleted_at: null
  })
    .sort({ created_at: -1 })
    .select("_id provider method status bank_details amount currency created_at");

  return payment || null;
};

module.exports = {
  createBankPaymentForOrder,
  getLatestPaymentForOrder
};
