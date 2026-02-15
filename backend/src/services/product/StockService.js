const Stock = require("../../models/product/Stock");
const StockView = require("../../models/product/view/StockView");
const Shop = require("../../models/shop/Shop");
const mongoose = require("mongoose");
const StockMouvementService =  require("./StockMouvementService");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createStockByProduct = async (idProduct, payload)=>{
  const stockPayload = {
    reste : payload.stock,
    alerte : payload.lowStockAlert,
    product : idProduct,
    shop  : payload.boutique
  };
  const stock = await createStock(stockPayload);
  return stock;
};

const createStock = async (payload) => {
  const stock = await Stock.create(payload);
  const mouvementStock = {
    in : stock.reste,
    stock : stock._id
  }
  await StockMouvementService.createMouvementSansUpdate(mouvementStock);
  return stock;
};

const getStocks = async () => {
  return Stock.find({ deleted_at: null })
    .populate({
      path: "product",
      populate: [
        { path: "product_category" },
        { path: "tags" }
      ]
    })
    .populate("shop");
};

const getStockById = async (id) => {
  const stock = await Stock.findById(id)
    .populate("product")
    .populate("shop");

  if (!stock) throw buildError("Stock introuvable", 404);
  return stock;
};

const updateStockByUpdateProduct = async(id, payload, stockToUpdate) =>{
  if(payload.stock == stockToUpdate.reste && payload.lowStockAlert == stockToUpdate.alerte ) return;
  let mvtPayload = {
    in : payload.stock > stockToUpdate.reste? payload.stock: 0,
    out : payload.stock < stockToUpdate.reste? payload.stock: 0,
    stock : id
  };
  await StockMouvementService.createMouvement(mvtPayload);
  
  const stockPayload = {
    alerte : payload.lowStockAlert
  };
  await updateStock(id,stockPayload);
}
const updateStock = async (id, payload) => {
  const stock = await Stock.findById(id)
    .populate("product")
    .populate("shop");
  if (!stock) throw buildError("Stock introuvable", 404);

  Object.assign(stock, payload);
  stock.reste = stock.in - stock.out;

  await stock.save();
  return stock;
};
const deleteStock = async (id) => {
  const stock = await Stock.findOneAndUpdate(
    {_id : id, deleted_at : null},
    {deleted_at : new Date()},
    {new: true}
  );
  if (!stock) throw buildError("Stock introuvable", 404);

  return stock;
};

const getStockByOwner = async (idOwner)=>{
  const stocks = await StockView.find({
    "shop.owner" :  new mongoose.Types.ObjectId(idOwner)
  });
  return stocks;

}

const getStockViewById = async (idStock)=>{
  const stocks = await StockView.find({
    "_id" :  new mongoose.Types.ObjectId(idStock)
  });
  return stocks;

}
module.exports = {
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
  getStockByOwner,
  createStockByProduct,
  getStockViewById,
  updateStockByUpdateProduct
};
