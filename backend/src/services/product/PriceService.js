const Price = require("../../models/product/Price");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createPrice = async (payload) => {
  return Price.create(payload);
};

const getPrices = async () => {
  return Price.find({ deleted_at: null })
    .populate({
      path: "stock",
      populate: {
        path: "product shop"
      }
    });
};

const getPriceById = async (id) => {
  const price = await Price.findOne({
    _id: id,
    deleted_at: null
  }).populate({
    path: "stock",
    populate: {
      path: "product shop"
    }
  });

  if (!price) throw buildError("Prix introuvable", 404);
  return price;
};

const updatePrice = async (id, payload) => {
  if (payload.started_date && payload.end_date) {
    if (payload.end_date <= payload.started_date) {
      throw buildError("La date de fin doit être supérieure à la date de début", 400);
    }
  }

  const price = await Price.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );

  if (!price) throw buildError("Prix introuvable", 404);

  return price;
};

const deletePrice = async (id) => {
  const price = await Price.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!price) throw buildError("Prix introuvable", 404);

  return price;
};

module.exports = {
  createPrice,
  getPrices,
  getPriceById,
  updatePrice,
  deletePrice
};
