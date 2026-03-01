const Product = require("../../models/product/Product");
const User = require("../../models/user/User");
const StockService = require("./StockService");
const PriceService = require ("./PriceService");
const PromotionService = require("./PromotionService");
const mongoose = require("mongoose");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const updateProductStockByFormulaire = async (idStock, payload) => {
  const stockToUpdate = await StockService.getStockViewById(idStock);
  
  const productPayload ={
    name : payload.name,
    reference  : payload.sku,
    description : payload.description,
    product_category : payload.category,
    poids : payload.weight,
    dimension : payload.dimensions,
    image : payload.image
  };
  await updateProduct(stockToUpdate.product._id,productPayload);
  await StockService.updateStockByUpdateProduct(idStock, payload, stockToUpdate);
  await PriceService.updatePriceByProduct(payload, stockToUpdate);
  await PromotionService.updatePromotionByProduct(payload,stockToUpdate);
  
};
const createProductStock = async (payload)=>{
    const productPayload ={
      name : payload.name,
      reference  : payload.sku,
      description : payload.description,
      product_category : payload.category,
      poids : payload.weight,
      dimension : payload.dimensions,
      image : payload.image
    };
    const product = await Product.create(productPayload);
    const stock = await StockService.createStockByProduct(product._id, payload);
    await PriceService.createPriceStock(stock._id, payload);
    if(payload.promoPrice && payload.promoPrice !== '')
      await PromotionService.createPromotionStock(stock._id,payload);
    

}
const createProduct = async (payload) =>
  Product.create(payload);

const getProducts = async () =>
  Product.find().populate("product_category").populate("tags");

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

const getFavoriteProductIdsByUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("Utilisateur invalide", 400);
  }

  const user = await User.findById(userId).select("favorite_products");
  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_products || []).map((id) => id.toString());
};

const addFavoriteProduct = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw buildError("Produit invalide", 400);
  }

  const product = await Product.findById(productId).select("_id");
  if (!product) throw buildError("Produit introuvable", 404);

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorite_products: product._id } },
    { new: true }
  ).select("favorite_products");

  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_products || []).map((id) => id.toString());
};

const removeFavoriteProduct = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw buildError("Produit invalide", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorite_products: new mongoose.Types.ObjectId(productId) } },
    { new: true }
  ).select("favorite_products");

  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_products || []).map((id) => id.toString());
};

const isFavoriteProduct = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw buildError("Produit invalide", 400);
  }

  const user = await User.findById(userId).select("favorite_products");
  if (!user) throw buildError("Utilisateur introuvable", 404);

  const favoriteSet = new Set((user.favorite_products || []).map((id) => id.toString()));
  return favoriteSet.has(productId.toString());
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductStock,
  updateProductStockByFormulaire,
  getFavoriteProductIdsByUser,
  addFavoriteProduct,
  removeFavoriteProduct,
  isFavoriteProduct
};
