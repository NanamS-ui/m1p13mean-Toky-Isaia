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

  const stockIn = payload.in || 0;
  const stockOut = payload.out || 0;
  stock.reste =stock.reste+ (stockIn - stockOut);

  if (stock.reste < 0) throw buildError("Stock insuffisant", 500);
  const mouvement = await StockMouvement.create(payload);

  await stock.save();

  return mouvement;
};


const getMouvements = async () => {
  return StockMouvement.find({ deleted_at: null })
    .populate("stock");
};

const getLastMouvementByStock = async (stockId) => {
  if (!mongoose.Types.ObjectId.isValid(stockId)) {
    throw buildError("Stock invalide", 400);
  }

  
  const mouvement = await StockMouvement.findOne({
    stock: stockId,
    deleted_at: null
  })
    .sort({ created_at: -1 }); 

  if (!mouvement) throw buildError("Aucun mouvement trouvé", 404);

  return mouvement;
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
  createMouvementSansUpdate,
  getLastMouvementByStock
};
