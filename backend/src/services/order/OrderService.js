const Order = require("../../models/order/Order");
const OrderItem = require("../../models/order/OrderItem");
const Stock = require("../../models/product/Stock");
const StockMouvement = require("../../models/product/StockMouvement");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createOrderWithItems = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    
    const order = await Order.create([{
      total: payload.total,
      orderCategory: payload.orderCategory,
      buyer: payload.buyer
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

    const savedOrder = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: "stock"
    });

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


const getOrderById = async (id) => {
  const order = await Order.findOne({ _id: id, deleted_at: null })
    .populate("orderCategory")
    .populate("buyer");
  if (!order) throw buildError("Commande introuvable", 404);
  return order;
};


const updateOrder = async (id, payload) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );
  if (!order) throw buildError("Commande introuvable", 404);
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
  getOrderById,
  updateOrder,
  deleteOrder
};
