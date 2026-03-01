const Price = require("../../models/product/Price");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createPriceStock= async(stockId, payload)=>{
  const pricePayload = {
    price : payload.price,
    stock : stockId,
    started_date : payload.priceStart && payload.priceStart !== ''
    ? new Date(payload.priceStart)
    : new Date(),
    end_date : payload.priceEnd && payload.priceEnd !== ''
    ? new Date(payload.priceEnd)
    : new Date(8640000000000000)
  };
  await Price.create(pricePayload);
}

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
const updatePriceByProduct = async(payload, stockToUpdate)=>{
  // Si current_price n'existe pas, créer une nouvelle entrée de prix
  if(!stockToUpdate.current_price) {
    const pricePayload = {
      price : payload.price,
      stock : stockToUpdate._id,
      started_date : payload.priceStart && payload.priceStart !== ''
      ? new Date(payload.priceStart)
      : new Date(),
      end_date : payload.priceEnd && payload.priceEnd !== ''
      ? new Date(payload.priceEnd)
      : new Date(8640000000000000)
    };
    await Price.create(pricePayload);
    return;
  }
  if(payload.price == stockToUpdate.current_price.price) {
    
    if(payload.priceStart != stockToUpdate.current_price.started_date ||
      payload.priceEnd != stockToUpdate.current_price.end_date
    ){
        const pricePayload = {
        price : payload.price,
        stock : stockToUpdate._id,
        started_date : payload.priceStart && payload.priceStart !== ''
        ? new Date(payload.priceStart)
        : new Date(),
        end_date : payload.priceEnd && payload.priceEnd !== ''
        ? new Date(payload.priceEnd)
        : new Date(8640000000000000)
      };
      await updatePrice(stockToUpdate.current_price._id, pricePayload);
      return;
    }
  }
  else{
    await updatePrice(stockToUpdate.current_price._id, {end_date : new Date()});
    const pricePayload = {
      price : payload.price,
      stock : stockToUpdate._id,
      started_date : payload.priceStart && payload.priceStart !== ''
      ? new Date(payload.priceStart)
      : new Date(),
      end_date : payload.priceEnd && payload.priceEnd !== ''
      ? new Date(payload.priceEnd)
      : new Date(8640000000000000)
    };
    console.log(pricePayload);
    await Price.create(pricePayload);
  }
}

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
  deletePrice,
  createPriceStock,
  updatePriceByProduct
};
