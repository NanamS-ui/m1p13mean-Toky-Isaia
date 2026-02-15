const mongoose = require("mongoose");
const StockMouvement = require("../../models/product/StockMouvement");
const Stock = require("../../models/product/Stock");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createMouvementSansUpdate = async (payload) => {

  if (!mongoose.Types.ObjectId.isValid(payload.stock)) {
    throw buildError("Stock invalide", 400);
  }
  const mouvement = await StockMouvement.create(payload);
  return mouvement;
};

const createMouvement = async (payload) => {

  if (!mongoose.Types.ObjectId.isValid(payload.stock)) {
    throw buildError("Stock invalide", 400);
  }

  const stock = await Stock.findById(payload.stock);
  if (!stock) throw buildError("Stock introuvable", 404);

  const mouvement = await StockMouvement.create(payload);

  
  stock.in += payload.in || 0;
  stock.out += payload.out || 0;
  stock.reste = stock.in - stock.out;

  if (stock.reste < 0) throw buildError("Stock insuffisant", 500);

  await stock.save();

  return mouvement;
};


const getMouvements = async () => {
  return StockMouvement.find({ deleted_at: null })
    .populate("stock");
};


const getMouvementByStock = async (stockId) => {

  if (!mongoose.Types.ObjectId.isValid(stockId)) {
    throw buildError("Stock invalide", 400);
  }

  return StockMouvement.find({
    stock: stockId,
    deleted_at: null
  }).populate("stock");
};


const deleteMouvement = async (id) => {

  const mouvement = await StockMouvement.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!mouvement) throw buildError("Mouvement introuvable", 404);

  return mouvement;
};

module.exports = {
  createMouvement,
  getMouvements,
  getMouvementByStock,
  deleteMouvement,
  createMouvementSansUpdate
};
