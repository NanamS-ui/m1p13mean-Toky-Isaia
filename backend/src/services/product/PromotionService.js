const Promotion = require("../../models/product/Promotion");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const createPromotionStock = async(idStock, payload)=>{
  const promotion = {
    percent : payload.promoPrice,
    stock : idStock,
    started_date : payload.promoStart && payload.promoStart !== ''
    ? new Date(payload.promoStart)
    : new Date(),
    end_date : payload.promoEnd && payload.promoEnd !== ''
    ? new Date(payload.promoEnd)
    : new Date(8640000000000000)
  };
  await Promotion.create(promotion);
};

const updatePromotionByProduct = async(payload, stockToUpdate)=>{
  if(payload.percent == stockToUpdate.current_promotion.promoPrice) {
    
    if(payload.promoStart != stockToUpdate.current_promotion.started_date ||
      payload.promoEnd != stockToUpdate.current_promotion.end_date
    ){
        const pricePayload = {
        price : payload.price,
        stock : stockToUpdate._id,
        started_date : payload.promoStart && payload.promoStart !== ''
        ? new Date(payload.promoStart)
        : new Date(),
        end_date : payload.promoEnd && payload.promoEnd !== ''
        ? new Date(payload.promoEnd)
        : new Date(8640000000000000)
      };
      await updatePromotion(stockToUpdate.current_promotion._id, pricePayload);
      return;
    }
  }
  else{
    await updatePromotion(stockToUpdate.current_promotion._id, {end_date : new Date()});
    pricePayload = {
      price : payload.price,
      stock : stockToUpdate._id,
      started_date : payload.promoStart && payload.promoStart !== ''
      ? new Date(payload.promoStart)
      : new Date(),
      end_date : payload.promoEnd && payload.promoEnd !== ''
      ? new Date(payload.promoEnd)
      : new Date(8640000000000000)
    };
    await createPromotion(pricePayload);
  }
}

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
  deletePromotion,
  createPromotionStock,
  updatePromotionByProduct
};
