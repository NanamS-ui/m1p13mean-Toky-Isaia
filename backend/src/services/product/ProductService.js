const Product = require("../../models/product/Product");
const StockService = require("./StockService");
const PriceService = require ("./PriceService");
const PromotionService = require("./PromotionService")
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const updateProductStockByFormulaire = async (idStock, payload) => {
  const stockToUpdate = await StockService.getStockViewById(idStock);
  console.log(stockToUpdate);
  const productPayload ={
    name : payload.name,
    reference  : payload.sku,
    description : payload.description,
    product_category : payload.category,
    poids : payload.weight,
    dimension : payload.dimensions
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
      dimension : payload.dimensions
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

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductStock,
  updateProductStockByFormulaire
};
