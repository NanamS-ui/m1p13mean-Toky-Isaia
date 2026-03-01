const ServiceCenterService = require("../../services/config/ServiceCenterService");

exports.createServiceCenter = async (req, res) => {
  try {
    const item = await ServiceCenterService.createServiceCenter(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getServiceCenters = async (req, res) => {
  try {
    const items = await ServiceCenterService.getServiceCenters();
    res.json(items);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getServiceCenterById = async (req, res) => {
  try {
    const item = await ServiceCenterService.getServiceCenterById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateServiceCenter = async (req, res) => {
  try {
    const item = await ServiceCenterService.updateServiceCenter(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteServiceCenter = async (req, res) => {
  try {
    await ServiceCenterService.deleteServiceCenter(req.params.id);
    res.json({ message: "Configuration supprimée avec succès" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
