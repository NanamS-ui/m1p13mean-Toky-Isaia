const Stock = require("../../models/product/Stock");

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
    if(payload.in !== undefined && payload.out !== undefined){
        payload.reste = payload.in - payload.out;
    }
    if(payload.reste<0) throw buildError("Stock insuffisant", 404);

    const stock = await Stock.findOneAndUpdate(
        {_id : id, deleted_at : null},
        payload,
        {new : true, runValidators : true})
        .populate("product")
        .populate("shop");
    if (!stock) throw buildError("Stock introuvable", 404);

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

module.exports = {
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock
};
