const Promotion = require("../../models/product/Promotion");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createPromotion = async (payload) => {
  return Promotion.create(payload);
};

const getPromotions = async () => {
  return Promotion.find({ deleted_at: null })
    .populate({
      path: "stock",
      populate: {
        path: "product shop"
      }
    });
};

const getPromotionById = async (id) => {
  const promotion = await Promotion.findOne({
    _id: id,
    deleted_at: null
  }).populate({
    path: "stock",
    populate: {
      path: "product shop"
    }
  });

  if (!promotion) throw buildError("Promotion introuvable", 404);

  return promotion;
};

const updatePromotion = async (id, payload) => {
  if (payload.started_date && payload.end_date) {
    if (payload.end_date <= payload.started_date) {
      throw buildError("La date de fin doit être supérieure à la date de début", 400);
    }
  }

  const promotion = await Promotion.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );

  if (!promotion) throw buildError("Promotion introuvable", 404);

  return promotion;
};

const deletePromotion = async (id) => {
  const promotion = await Promotion.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!promotion) throw buildError("Promotion introuvable", 404);

  return promotion;
};

module.exports = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion
};
