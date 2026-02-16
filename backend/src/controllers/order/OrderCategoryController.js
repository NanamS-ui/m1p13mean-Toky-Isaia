const OrderCategoryService = require("../../services/order/OrderCategoryService");

exports.createOrderCategory = async (req, res) => {
  try {
    const category = await OrderCategoryService.createOrderCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getOrderCategories = async (req, res) => {
  try {
    const categories = await OrderCategoryService.getOrderCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderCategoryById = async (req, res) => {
  try {
    const category = await OrderCategoryService.getOrderCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateOrderCategory = async (req, res) => {
  try {
    const category = await OrderCategoryService.updateOrderCategory(
      req.params.id,
      req.body
    );
    res.json(category);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteOrderCategory = async (req, res) => {
  try {
    await OrderCategoryService.deleteOrderCategory(req.params.id);
    res.json({ message: "Catégorie supprimée" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
