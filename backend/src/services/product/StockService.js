const Stock = require("../../models/product/Stock");
const StockView = require("../../models/product/view/StockView");
const Shop = require("../../models/shop/Shop");
const mongoose = require("mongoose");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createStock = async (payload) => {
  return Stock.create(payload);
};

const getStocks = async () => {
  return Stock.find({ deleted_at: null })
    .populate("product")
    .populate("shop");
};

const getStockById = async (id) => {
  const stock = await Stock.findById(id)
    .populate("product")
    .populate("shop");

  if (!stock) throw buildError("Stock introuvable", 404);
  return stock;
};


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
module.exports = {
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
  getStockByOwner
};
