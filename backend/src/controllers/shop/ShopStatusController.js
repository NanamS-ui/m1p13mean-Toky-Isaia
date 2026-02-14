const ShopStatusService = require("../../services/shop/ShopStatusService");


exports.createShopStatus = async (req, res) => {
  try {
    const status = await ShopStatusService.createShopStatus(req.body);
    res.status(201).json(status);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};


exports.getShopStatuses = async (req, res) => {
  try {
    const statuses = await ShopStatusService.getShopStatuses();
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getShopStatusById = async (req, res) => {
  try {
    const status = await ShopStatusService.getShopStatusById(req.params.id);
    res.json(status);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};


exports.updateShopStatus = async (req, res) => {
  try {
    const status = await ShopStatusService.updateShopStatus(
      req.params.id,
      req.body
    );
    res.json(status);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};


exports.deleteShopStatus = async (req, res) => {
  try {
    await ShopStatusService.deleteShopStatus(req.params.id);
    res.json({ message: "Statut supprimé avec succès" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.getStatusByValue = async (req, res) => {
  try {
    const { value } = req.params;

    const status = await ShopStatusService.getStatusByValue(value);

    res.status(200).json(status);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};
