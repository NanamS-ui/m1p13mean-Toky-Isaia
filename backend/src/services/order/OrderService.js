const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");
const Stock = require("../../models/product/Stock");
const StockMouvement = require("../../models/product/StockMouvement");
const OrderCategory = require("../../models/order/OrderCategory");
const Payment = require("../../models/payment/Payment");
const mongoose = require("mongoose");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};


const createOrderWithItems = async (payload, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    
    const defaultCategory = await OrderCategory.findOne({value : "En attente"});
    
    if(! defaultCategory) throw buildError("Categorie 'En attente' introuvable", 500);
    const order = await Order.create([{
      total: payload.total,
      orderCategory: defaultCategory._id,
      buyer: userId
    }], { session });

    const orderId = order[0]._id;

    for (const item of payload.orderItems) {
      const stock = await Stock.findById(item.stock).session(session);
      if (!stock) throw buildError("Stock introuvable", 404);

      if (stock.reste < item.quantity) throw buildError("Stock insuffisant", 400);

      await OrderItem.create([{
        order: orderId,
        unit_price: item.unit_price,
        promotion_percentage: item.promotion_percentage || 0,
        quantity: item.quantity,
        stock: stock._id
      }], { session });

      
      out = item.quantity;
      stock.reste -= item.quantity;
      await stock.save({ session });

     
      await StockMouvement.create([{
        out: item.quantity,
        stock: stock._id
      }], { session });
    }


    await session.commitTransaction();
    session.endSession();

    const savedOrder = await Order.findById(orderId).populate("orderCategory")
                                                    .populate("buyer");

    return savedOrder;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


const createOrder = async (payload) => Order.create(payload);


const getOrders = async () => Order.find({ deleted_at: null })
  .populate("orderCategory")
  .populate("buyer");

const getOrdersByBuyerId = async (buyerId) => {
  const orders = await Order.find({ buyer: buyerId, deleted_at: null })
    .sort({ created_at: -1 })
    .populate("orderCategory")
    .populate({
      path: "orderItems",
      match: { deleted_at: null },
      populate: {
        path: "stock",
        select: "shop",
        populate: {
          path: "shop",
          select: "name"
        }
      }
    });

  return orders;
};


const getOrderById = async (id) => {
  const order = await Order.findOne({
    _id: id,
    deleted_at: null
  })
  .populate("orderCategory")
  .populate("buyer")
  .populate({
    path: "orderItems",
    match: { deleted_at: null },
    populate: {
      path: "stock",
      populate: [
        { path: "product" },
        { path: "shop" }
      ]
    }
  });

  if (!order) throw buildError("Commande introuvable", 404);

  return order;
};

const getOrderByOwnerId = async (owner) => {
  const orders = await Order.aggregate([
      { $match: {deleted_at: null}},
          {$lookup: {from: "order_categories", let : {idCategory : "$orderCategory" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idCategory"]}}}, 
            {$project:{_id:1, value:1}}], as: "orderCategory"}},
          {$unwind: "$orderCategory"},
          {$lookup: { from: "users", let : {idUser : "$buyer" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idUser"]}}}, 
            {$project:{_id:1, name:1,email:1}}],as: "buyer"}},
          {$unwind : "$buyer"},
          {$lookup: { from: "order_items", let : {orderId : "$_id"},pipeline :[{$match: {$expr : {$eq : ["$order", "$$orderId"]}}},
            {$project: {_id :1,stock : 1,deleted_at : 1}}],as: "orderItems"}},
          {$unwind: "$orderItems"},
          {$match: {"orderItems.deleted_at": null}},
          { $lookup: {from: "stocks", let : {stockId :"$orderItems.stock" },pipeline:[{$match:{$expr:{$eq : ["$_id","$$stockId" ]}}},
            {$project:{_id : 1,product : 1,shop : 1}}],as: "stock"}},
          { $unwind: "$stock" },
          {$lookup: {from: "products",let : { productId : "$stock.product"},pipeline : [{ $match: {$expr : {$eq : ["$_id", "$$productId"]}}},
            {$project: {_id : 1,name : 1}}],as : "product"}},
          { $unwind: "$product" },
          {$lookup: {from: "shops",let: { shopId: "$stock.shop" },pipeline: [{$match: {$expr: { $eq: ["$_id", "$$shopId"] }}},
            {$project: {_id: 1,owner: 1}}],as: "shop"}},
          { $unwind: "$shop" },
          {$match:{"shop.owner": new mongoose.Types.ObjectId("698feee872bf4c1098012a51")}}
          ,{$group: {_id: "$_id", order: { $first: "$$ROOT" }}},
          {$replaceRoot: { newRoot: "$order" }},
          {$project: {
            _id:1,orderCategory:1,total:1,buyer:1,created_at:1
          }}
    ]);
  return orders;
};



const updateOrder = async (id, payload) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );
  if (!order) throw buildError("Commande introuvable", 404);

  // Si la boutique met à jour le statut (orderCategory), on synchronise le paiement associé.
  // Règles (selon OrderCategory.value):
  // - En attente / Confirmée / En préparation -> WAITING_CONFIRMATION
  // - Livrée  -> CONFIRMED
  // - Annulée -> REJECTED
  // Le paiement suit toujours le statut de la commande.
  if (payload && Object.prototype.hasOwnProperty.call(payload, "orderCategory")) {
    const category = await OrderCategory.findById(order.orderCategory).select("value");
    const categoryValue = category?.value;

    const statusMap = {
      // Valeurs FR
      "En attente": "WAITING_CONFIRMATION",
      "Confirmée": "CONFIRMED",
      "En préparation": "IN_PREPARATION",
      "Expédiée": "SHIPPED",
      "Expediee": "SHIPPED",
      "Livrée": "DELIVERY_EFFECTED",
      "Livree": "DELIVERY_EFFECTED",
      "Annulée": "REJECTED",
      "Annulee": "REJECTED",

      // Valeurs CODE (le paiement suit toujours le statut)
      WAITING_CONFIRMATION: "WAITING_CONFIRMATION",
      CONFIRMED: "CONFIRMED",
      IN_PREPARATION: "IN_PREPARATION",
      SHIPPED: "SHIPPED",
      DELIVERY_EFFECTED: "DELIVERY_EFFECTED",
      REJECTED: "REJECTED"
    };

    const key = String(categoryValue || "").trim();
    const nextPaymentStatus = statusMap[key] || statusMap[key.toUpperCase()] || null;

    if (nextPaymentStatus) {
      const latestPayment = await Payment.findOne({
        order: order._id,
        deleted_at: null
      })
        .sort({ created_at: -1 })
        .select("_id status");

      if (latestPayment) {
        if (latestPayment.status !== nextPaymentStatus) {
          await Payment.findByIdAndUpdate(
            latestPayment._id,
            { status: nextPaymentStatus },
            { runValidators: true }
          );
        }
      }
    }
  }

  return order;
};


const deleteOrder = async (id) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );
  if (!order) throw buildError("Commande introuvable", 404);
  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrdersByBuyerId,
  getOrderById,
  updateOrder,
  deleteOrder,
  createOrderWithItems,
  getOrderByOwnerId
};
