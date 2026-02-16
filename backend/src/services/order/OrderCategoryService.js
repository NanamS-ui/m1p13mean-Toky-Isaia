const OrderCategory = require("../../models/order/OrderCategory");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createOrderCategory = async (payload) =>
  OrderCategory.create(payload);

const getOrderCategories = async () =>
  OrderCategory.find();

const getOrderCategoryById = async (id) => {
  const category = await OrderCategory.findById(id);
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const updateOrderCategory = async (id, payload) => {
  const category = await OrderCategory.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const deleteOrderCategory = async (id) => {
  const category = await OrderCategory.findByIdAndDelete(id);
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

module.exports = {
  createOrderCategory,
  getOrderCategories,
  getOrderCategoryById,
  updateOrderCategory,
  deleteOrderCategory
};
