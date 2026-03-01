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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPopularity = (stockId, productId) => {
  const seed = `${stockId ?? ""}${productId ?? ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return 50 + Math.abs(hash % 50);
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
  if(payload.stock == stockToUpdate.reste && payload.lowStockAlert == stockToUpdate.alerte && payload.boutique === stockToUpdate.shop ) return;
  if(payload.stock != stockToUpdate.reste){
    let mvtPayload = {
      in : payload.stock > stockToUpdate.reste? payload.stock -stockToUpdate.reste: 0,
      out : payload.stock < stockToUpdate.reste? stockToUpdate.reste- payload.stock: 0,
      stock : id
    };
    await StockMouvementService.createMouvement(mvtPayload);
  }
  const stockPayload = {
    alerte : payload.lowStockAlert,
    shop : payload.boutique
  };
  
  await updateStock(id,stockPayload);
}
const updateStock = async (id, payload) => {
  const stock = await Stock.findById(id)
    .populate("product")
    .populate("shop");
  if (!stock) throw buildError("Stock introuvable", 404);

  Object.assign(stock, payload);
  // stock.reste = stock.in - stock.out;

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
    "shop.owner" :  new mongoose.Types.ObjectId(idOwner),
    deleted_at: null
  });
  return stocks;

}

const getStockViewById = async (idStock)=>{
  const stocks = await StockView.findOne({
    "_id" :  new mongoose.Types.ObjectId(idStock)
  });
  return stocks;

}

const getCatalog = async (filters = {}) => {
  const searchQuery = (filters.searchQuery || "").trim();
  const selectedCategory = (filters.selectedCategory || "").trim();
  const shopId = (filters.shopId || "").trim();
  const productId = (filters.productId || "").trim();
  const minPrice = filters.minPrice !== undefined ? Number(filters.minPrice) : null;
  const maxPrice = filters.maxPrice !== undefined ? Number(filters.maxPrice) : null;
  const inStockOnly = filters.inStockOnly === true || filters.inStockOnly === "true";
  const onPromoOnly = filters.onPromoOnly === true || filters.onPromoOnly === "true";
  const sortBy = filters.sortBy || "popularity";

  const pipeline = [];
  pipeline.push({ $match: { deleted_at: null } });

  pipeline.push({
    $addFields: {
      currentPrice: { $ifNull: ["$current_price.price", 0] },
      promoPercent: { $ifNull: ["$current_promotion.percent", 0] }
    }
  });

  pipeline.push({
    $addFields: {
      effectivePrice: {
        $cond: [
          { $and: [{ $gt: ["$promoPercent", 0] }, { $gt: ["$currentPrice", 0] }] },
          { $round: [{ $multiply: ["$currentPrice", { $subtract: [1, { $divide: ["$promoPercent", 100] }] }] }, 0] },
          "$currentPrice"
        ]
      }
    }
  });

  if (shopId) {
    const shopFilters = [
      { "shop._id": shopId },
      { "shop": shopId }
    ];
    if (mongoose.Types.ObjectId.isValid(shopId)) {
      shopFilters.push({ "shop._id": new mongoose.Types.ObjectId(shopId) });
    }
    pipeline.push({ $match: { $or: shopFilters } });
  }

  if (productId) {
    const productFilters = [
      { "product._id": productId },
      { "product": productId }
    ];
    if (mongoose.Types.ObjectId.isValid(productId)) {
      productFilters.push({ "product._id": new mongoose.Types.ObjectId(productId) });
    }
    pipeline.push({ $match: { $or: productFilters } });
  }

  if (searchQuery) {
    const regex = new RegExp(escapeRegex(searchQuery), "i");
    pipeline.push({
      $match: {
        $or: [
          { "product.name": regex },
          { "product.description": regex },
          { "product.product_category.value": regex },
          { "shop.name": regex },
          { "product.tags.value": regex }
        ]
      }
    });
  }

  if (selectedCategory) {
    const catFilters = [
      { "product.product_category.value": selectedCategory },
      { "product.product_category": selectedCategory }
    ];
    if (mongoose.Types.ObjectId.isValid(selectedCategory)) {
      catFilters.push({ "product.product_category._id": new mongoose.Types.ObjectId(selectedCategory) });
    }
    pipeline.push({ $match: { $or: catFilters } });
  }

  if (inStockOnly) {
    pipeline.push({ $match: { reste: { $gt: 0 } } });
  }

  if (onPromoOnly) {
    pipeline.push({ $match: { promoPercent: { $gt: 0 } } });
  }

  if (!Number.isNaN(minPrice) && minPrice !== null) {
    pipeline.push({ $match: { $expr: { $gte: ["$effectivePrice", minPrice] } } });
  }

  if (!Number.isNaN(maxPrice) && maxPrice !== null) {
    pipeline.push({ $match: { $expr: { $lte: ["$effectivePrice", maxPrice] } } });
  }

  const stocks = await StockView.aggregate(pipeline);

  const mapped = stocks.map(stock => {
    const product = stock.product || {};
    const shop = stock.shop || {};
    const category = product?.product_category?.value || "";
    const tags = Array.isArray(product?.tags)
      ? product.tags.map(tag => (typeof tag === "string" ? tag : tag?.value)).filter(Boolean)
      : [];
    const currentPrice = Number(stock.currentPrice ?? 0);
    const promoPercent = Number(stock.promoPercent ?? 0);
    const onPromo = promoPercent > 0 && currentPrice > 0;
    const promoPrice = onPromo
      ? Math.round(currentPrice * (1 - promoPercent / 100))
      : undefined;
    const createdAt = stock.created_at || product.created_at || new Date().toISOString();
    const popularity = buildPopularity(stock._id, product._id);

    return {
      id: product?._id || stock._id,
      stockId: stock._id,
      name: product?.name || "",
      description: product?.description || "",
      price: currentPrice,
      promoPrice,
      category,
      tags,
      boutiqueId: shop?._id || "",
      boutiqueName: shop?.name || "",
      boutiqueLogo: shop?.logo,
      image: product?.image,
      inStock: (stock.reste ?? 0) > 0,
      stockQuantity: stock.reste ?? 0,
      onPromo,
      popularity,
      createdAt
    };
  });

  if (sortBy === "newest") {
    mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "price-asc") {
    mapped.sort((a, b) => (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price));
  } else if (sortBy === "price-desc") {
    mapped.sort((a, b) => (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price));
  } else {
    mapped.sort((a, b) => b.popularity - a.popularity);
  }

  return mapped;
};
module.exports = {
  createStock,
  getStocks,
  getStockById,
  updateStock,
  deleteStock,
  getStockByOwner,
  createStockByProduct,
  getStockViewById,
  updateStockByUpdateProduct,
  getCatalog
};
