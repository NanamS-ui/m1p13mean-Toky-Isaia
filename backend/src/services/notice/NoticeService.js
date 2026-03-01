const mongoose = require("mongoose");

const Notice = require("../../models/notice/Notice");
const Order = require("../../models/order/Order");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeType = (type) => {
  const t = String(type || "").trim().toLowerCase();
  if (t === "shop" || t === "product") return t;
  return null;
};

const createNotice = async ({ userId, payload }) => {
  const type = normalizeType(payload?.type);
  if (!type) throw buildError("Type d'avis invalide", 400);

  const rating = Number(payload?.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw buildError("Note invalide (1 à 5)", 400);
  }

  const comment = String(payload?.comment || "").trim();
  if (!comment) throw buildError("Commentaire requis", 400);

  const shop = payload?.shop ?? payload?.shopId;
  const product = payload?.product ?? payload?.productId;
  const order = payload?.order ?? payload?.orderId;

  let resolvedShop = shop;
  let resolvedProduct = product;

  if (type === "shop") {
    // shopId est requis, mais si on a un orderId on peut le déduire (commande mono-boutique)
    if (!resolvedShop) {
      if (!order || !isValidObjectId(order)) throw buildError("shopId requis", 400);

      const fullOrder = await Order.findById(order).populate({
        path: "orderItems",
        populate: {
          path: "stock",
          select: "shop product",
          populate: [{ path: "shop", select: "name" }, { path: "product", select: "name" }]
        }
      });

      if (!fullOrder) throw buildError("Commande introuvable", 404);

      const items = Array.isArray(fullOrder.orderItems) ? fullOrder.orderItems : [];
      const shopIds = new Set(
        items
          .map((it) => it?.stock?.shop?._id || it?.stock?.shop)
          .filter(Boolean)
          .map((id) => String(id))
      );

      if (shopIds.size === 0) throw buildError("Impossible de déterminer la boutique", 400);
      if (shopIds.size > 1) throw buildError("Commande multi-boutiques: shopId requis", 400);

      resolvedShop = Array.from(shopIds)[0];
    }

    if (!isValidObjectId(resolvedShop)) throw buildError("shopId invalide", 400);
  }

  if (type === "product") {
    if (!resolvedProduct || !isValidObjectId(resolvedProduct)) throw buildError("productId requis", 400);
    if (resolvedShop && !isValidObjectId(resolvedShop)) throw buildError("shopId invalide", 400);
  }

  if (order && !isValidObjectId(order)) throw buildError("orderId invalide", 400);

  return await Notice.create({
    type,
    rating,
    comment,
    status: "published",
    user: userId,
    shop: resolvedShop || null,
    product: resolvedProduct || null,
    order: order || null
  });
};

const getMyNotices = async ({ userId, type }) => {
  const q = { user: userId };
  const normalizedType = type ? normalizeType(type) : null;
  if (normalizedType) q.type = normalizedType;

  return await Notice.find(q)
    .sort({ created_at: -1 })
    .populate("user")
    .populate("shop")
    .populate("product")
    .populate("order");
};

const getNoticesByShop = async ({ shopId }) => {
  if (!shopId || !isValidObjectId(shopId)) throw buildError("shopId invalide", 400);

  return await Notice.find({ type: "shop", shop: shopId, status: "published" })
    .sort({ created_at: -1 })
    .populate("user")
    .populate("shop")
    .populate("order");
};

const getNoticesByProduct = async ({ productId }) => {
  if (!productId || !isValidObjectId(productId)) throw buildError("productId invalide", 400);

  return await Notice.find({ type: "product", product: productId, status: "published" })
    .sort({ created_at: -1 })
    .populate("user")
    .populate("shop")
    .populate("product")
    .populate("order");
};

const getShopNoticeSummaries = async ({ shopIds }) => {
  const ids = Array.isArray(shopIds) ? shopIds : [];
  const normalizedIds = ids.map((id) => String(id)).filter(Boolean);

  const validIds = normalizedIds.filter((id) => isValidObjectId(id));
  if (validIds.length === 0) return [];

  const objectIds = validIds.map((id) => new mongoose.Types.ObjectId(id));

  const rows = await Notice.aggregate([
    {
      $match: {
        type: "shop",
        status: "published",
        shop: { $in: objectIds }
      }
    },
    {
      $group: {
        _id: "$shop",
        reviewCount: { $sum: 1 },
        rating: { $avg: "$rating" }
      }
    }
  ]);

  return rows.map((r) => ({
    shopId: String(r._id),
    reviewCount: Number(r.reviewCount) || 0,
    rating: Math.round((Number(r.rating) || 0) * 10) / 10
  }));
};

const updateMyNotice = async ({ userId, noticeId, payload }) => {
  if (!isValidObjectId(noticeId)) throw buildError("Id invalide", 400);

  const notice = await Notice.findOne({ _id: noticeId, user: userId });
  if (!notice) throw buildError("Avis introuvable", 404);

  if (payload?.rating != null) {
    const rating = Number(payload.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw buildError("Note invalide (1 à 5)", 400);
    }
    notice.rating = rating;
  }

  if (payload?.comment != null) {
    const comment = String(payload.comment || "").trim();
    if (!comment) throw buildError("Commentaire requis", 400);
    notice.comment = comment;
  }

  await notice.save();
  return notice;
};

const deleteMyNotice = async ({ userId, noticeId }) => {
  if (!isValidObjectId(noticeId)) throw buildError("Id invalide", 400);

  const deleted = await Notice.findOneAndDelete({ _id: noticeId, user: userId });
  if (!deleted) throw buildError("Avis introuvable", 404);
  return deleted;
};

module.exports = {
  createNotice,
  getMyNotices,
  getNoticesByShop,
  getNoticesByProduct,
  getShopNoticeSummaries,
  updateMyNotice,
  deleteMyNotice
};
