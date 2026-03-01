const Service = require("../../services/product/StockMouvementService");

exports.create = async (req, res) => {
  try {
    const data = await Service.createMouvement(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Service.getMouvements();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByStock = async (req, res) => {
  try {
    const data = await Service.getMouvementByStock(req.params.stockId);
    res.json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await Service.deleteMouvement(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
