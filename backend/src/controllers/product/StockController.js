const StockService = require("../../services/product/StockService");

exports.createStock = async (req, res) => {
  try {
    const stock = await StockService.createStock(req.body);
    res.status(201).json(stock);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getStocks = async (req, res) => {
  try {
    const stocks = await StockService.getStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const stock = await StockService.getStockById(req.params.id);
    res.json(stock);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const stock = await StockService.updateStock(
      req.params.id,
      req.body
    );
    res.json(stock);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    await StockService.deleteStock(req.params.id);
    res.json({ message: "Stock supprimé (soft delete)" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
