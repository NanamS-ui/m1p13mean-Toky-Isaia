const InfoCenterService = require("../../services/config/InfoCenterService");

exports.createInfoCenter = async (req, res) => {
  try {
    const item = await InfoCenterService.createInfoCenter(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getInfoCenters = async (req, res) => {
  try {
    const items = await InfoCenterService.getInfoCenters();
    res.json(items);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getInfoCenterById = async (req, res) => {
  try {
    const item = await InfoCenterService.getInfoCenterById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateInfoCenter = async (req, res) => {
  try {
    const item = await InfoCenterService.updateInfoCenter(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteInfoCenter = async (req, res) => {
  try {
    await InfoCenterService.deleteInfoCenter(req.params.id);
    res.json({ message: "Configuration supprimee avec succes" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};
