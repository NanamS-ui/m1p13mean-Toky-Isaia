const PromotionService = require("../../services/product/PromotionService");

exports.createPromotion = async (req, res) => {
  try {
    const promotion = await PromotionService.createPromotion(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await PromotionService.getPromotions();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await PromotionService.getPromotionById(req.params.id);
    res.json(promotion);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await PromotionService.updatePromotion(
      req.params.id,
      req.body
    );
    res.json(promotion);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deletePromotion = async (req, res) => {
  try {
    await PromotionService.deletePromotion(req.params.id);
    res.json({ message: "Promotion supprimée (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
