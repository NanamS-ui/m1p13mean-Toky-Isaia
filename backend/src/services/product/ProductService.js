const Product = require("../../models/product/Product");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createProduct = async (payload) =>
  Product.create(payload);

const getProducts = async () =>
  Product.find().populate("product_category");

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("product_category");

  if (!product) throw buildError("Produit introuvable", 404);
  return product;
};

const updateProduct = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  ).populate("product_category");

  if (!product) throw buildError("Produit introuvable", 404);
  return product;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw buildError("Produit introuvable", 404);
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
