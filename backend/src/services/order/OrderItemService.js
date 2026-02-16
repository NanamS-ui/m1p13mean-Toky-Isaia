const OrderItem = require("../../models/order/OrderItem");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};


const createOrderItem = async (payload) => OrderItem.create(payload);


const getOrderItems = async () => OrderItem.find({ deleted_at: null }).populate("stock");


const getOrderItemById = async (id) => {
  const item = await OrderItem.findOne({ _id: id, deleted_at: null }).populate("stock");
  if (!item) throw buildError("Order item introuvable", 404);
  return item;
};

const getOrderId = async (Orderid) => {
  const item = await OrderItem.find({ order: Orderid, deleted_at: null })
  .populate({
    path: "stock",
    populate: [
      { path: "product" },
      { path: "shop" }
    ]
  });
  return item;
};


const updateOrderItem = async (id, payload) => {
  const item = await OrderItem.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  ).populate("stock");
  if (!item) throw buildError("Order item introuvable", 404);
  return item;
};


const deleteOrderItem = async (id) => {
  const item = await OrderItem.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );
  if (!item) throw buildError("Order item introuvable", 404);
  return item;
};

module.exports = {
  createOrderItem,
  getOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem
};
