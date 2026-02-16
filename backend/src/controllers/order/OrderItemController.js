const OrderItemService = require("../../services/order/OrderItemService");

exports.createOrderItem = async (req, res) => {
  try {
    const item = await OrderItemService.createOrderItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getOrderItems = async (req, res) => {
  try {
    const items = await OrderItemService.getOrderItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItemService.getOrderItemById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateOrderItem = async (req, res) => {
  try {
    const item = await OrderItemService.updateOrderItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    await OrderItemService.deleteOrderItem(req.params.id);
    res.json({ message: "Order item supprimé (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
