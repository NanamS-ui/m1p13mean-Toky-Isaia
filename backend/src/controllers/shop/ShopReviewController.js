const ShopReviewService = require("../../services/shop/ShopReviewService");

exports.createShopReview = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const review = await ShopReviewService.createShopReview({ ...req.body, user: userId });
    res.status(201).json(review);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getShopReviews = async (req, res) => {
  try {
    const reviews = await ShopReviewService.getShopReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getShopReviewById = async (req, res) => {
  try {
    const review = await ShopReviewService.getShopReviewById(req.params.id);
    res.json(review);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateShopReview = async (req, res) => {
  try {
    const review = await ShopReviewService.updateShopReview(req.params.id, req.body);
    res.json(review);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteShopReview = async (req, res) => {
  try {
    await ShopReviewService.deleteShopReview(req.params.id);
    res.json({ message: "Avis supprimé" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.getShopReviewsByOwner = async (req, res) => {
  try {
    let { ownerId } = req.query;
    if (!ownerId) {
      ownerId = req.user.id;
    }

    const reviews = await ShopReviewService.getShopReviewsByOwner(ownerId);
    res.json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
exports.getShopReviewsByShop = async (req, res) => {
  try {
    let { shopId } = req.query;
    if (!shopId) {
      res.status(400).json({ message: "Shop id is required" });
    }

    const reviews = await ShopReviewService.getShopReviewsByShop(shopId);
    res.json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
