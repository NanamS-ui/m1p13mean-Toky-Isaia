const ProductCategory = require("../../models/product/ProductCategory");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createProductCategory = async (payload) =>
  ProductCategory.create(payload);

const getProductCategories = async () =>
  ProductCategory.find();

const getProductCategoryById = async (id) => {
  const category = await ProductCategory.findById(id);
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const updateProductCategory = async (id, payload) => {
  const category = await ProductCategory.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const deleteProductCategory = async (id) => {
  const category = await ProductCategory.findByIdAndDelete(id);
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

module.exports = {
  createProductCategory,
  getProductCategories,
  getProductCategoryById,
  updateProductCategory,
  deleteProductCategory
};
