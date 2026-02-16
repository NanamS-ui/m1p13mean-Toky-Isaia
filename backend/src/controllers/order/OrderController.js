const OrderService = require("../../services/order/OrderService");

exports.createOrder = async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await OrderService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await OrderService.updateOrder(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await OrderService.deleteOrder(req.params.id);
    res.json({ message: "Commande supprimée (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
