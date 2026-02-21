const buildError = require("../../utils/buildError");

const Order = require("../../models/order/Order");
const Payment = require("../../models/payment/Payment");

const formatMoney = (amount) => {
  const n = Number(amount || 0);
  const safe = Number.isFinite(n) ? n : 0;
  // On force le séparateur de milliers à '.' (ex: 12.000) au lieu des espaces/narrow no-break spaces.
  const formatted = safe.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
  const dotted = formatted.replace(/\u202f|\u00a0| /g, ".");
  return `${dotted} MGA`;
};

const computeOrderLines = (order) => {
  const items = Array.isArray(order?.orderItems) ? order.orderItems : [];

  const lines = items
    .filter((it) => !it?.deleted_at)
    .map((it) => {
      const productName =
        it?.stock?.product?.name || it?.stock?.product?.title || "Produit";
      const quantityRaw = Number(it?.quantity || 0);
      const unitPriceRaw = Number(it?.unit_price || 0);
      const promoPctRaw = Number(it?.promotion_percentage || 0);

      const quantity = Number.isFinite(quantityRaw) ? quantityRaw : 0;
      const unitPrice = Number.isFinite(unitPriceRaw) ? unitPriceRaw : 0;
      const promoPct = Number.isFinite(promoPctRaw) ? promoPctRaw : 0;

      const discountedUnit = unitPrice * (1 - promoPct / 100);
      const lineTotal = discountedUnit * quantity;

      return {
        productName: String(productName),
        quantity,
        unitPrice,
        promoPct,
        discountedUnit,
        lineTotal
      };
    });

  const subtotal = lines.reduce((sum, l) => sum + (Number(l.lineTotal) || 0), 0);

  return {
    lines,
    subtotal,
    subtotalLabel: formatMoney(subtotal)
  };
};

const getOrderForBuyer = async ({ orderId, userId }) => {
  const order = await Order.findOne({ _id: orderId, deleted_at: null })
    .populate("orderCategory")
    .populate("buyer")
    .populate({
      path: "orderItems",
      match: { deleted_at: null },
      populate: {
        path: "stock",
        populate: [{ path: "product" }, { path: "shop" }]
      }
    });

  if (!order) throw buildError("Commande introuvable", 404);

  if (String(order.buyer?._id || order.buyer) !== String(userId)) {
    throw buildError("Accès interdit à cette commande", 403);
  }

  return order;
};

const getLatestPaymentForBuyerOrder = async ({ orderId, userId }) => {
  const payment = await Payment.findOne({
    order: orderId,
    user: userId,
    deleted_at: null
  })
    .sort({ created_at: -1 })
    .select("_id provider method status bank_details amount currency created_at");

  return payment || null;
};

const buildInvoiceData = async ({ orderId, userId }) => {
  const order = await getOrderForBuyer({ orderId, userId });
  const payment = await getLatestPaymentForBuyerOrder({ orderId, userId });
  const { lines, subtotal, subtotalLabel } = computeOrderLines(order);

  return {
    type: "INVOICE",
    issuedAt: new Date(),
    order,
    payment,
    lines,
    subtotal,
    subtotalLabel,
    total: Number(order.total || 0),
    totalLabel: formatMoney(order.total)
  };
};

const buildReceiptData = async ({ orderId, userId }) => {
  const order = await getOrderForBuyer({ orderId, userId });
  const payment = await getLatestPaymentForBuyerOrder({ orderId, userId });

  // Règle: le reçu est une preuve de paiement, donc dispo uniquement une fois payé.
  // Dans ce projet: DELIVERY_EFFECTED (et compatibilité CONFIRMED si d'anciennes données existent).
  const paymentStatus = String(payment?.status || "").toUpperCase();
  const allowed = new Set(["DELIVERY_EFFECTED", "CONFIRMED"]);
  if (!payment || !allowed.has(paymentStatus)) {
    throw buildError(
      "Reçu indisponible: paiement non effectué ou non validé",
      400
    );
  }

  const { lines, subtotal, subtotalLabel } = computeOrderLines(order);

  return {
    type: "RECEIPT",
    issuedAt: new Date(),
    order,
    payment,
    lines,
    subtotal,
    subtotalLabel,
    total: Number(order.total || 0),
    totalLabel: formatMoney(order.total)
  };
};

module.exports = {
  buildInvoiceData,
  buildReceiptData,
  formatMoney
};
