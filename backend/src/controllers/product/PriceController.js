const PriceService = require("../../services/product/PriceService");

exports.createPrice = async (req, res) => {
  try {
    const price = await PriceService.createPrice(req.body);
    res.status(201).json(price);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getPrices = async (req, res) => {
  try {
    const prices = await PriceService.getPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPriceById = async (req, res) => {
  try {
    const price = await PriceService.getPriceById(req.params.id);
    res.json(price);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const price = await PriceService.updatePrice(
      req.params.id,
      req.body
    );
    res.json(price);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    await PriceService.deletePrice(req.params.id);
    res.json({ message: "Prix supprimé (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
