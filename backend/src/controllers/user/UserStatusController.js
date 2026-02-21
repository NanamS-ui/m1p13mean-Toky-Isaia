const UserStatusService = require("../../services/user/UserStatusService");

exports.createUserStatus = async (req, res) => {
  try {
    const status = await UserStatusService.createUserStatus(req.body);
    res.status(201).json(status);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getUserStatuses = async (req, res) => {
  try {
    const statuses = await UserStatusService.getUserStatuses();
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserStatusById = async (req, res) => {
  try {
    const status = await UserStatusService.getUserStatusById(req.params.id);
    res.json(status);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const status = await UserStatusService.updateUserStatus(
      req.params.id,
      req.body
    );
    res.json(status);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteUserStatus = async (req, res) => {
  try {
    await UserStatusService.deleteUserStatus(req.params.id);
    res.json({ message: "User status supprimé" });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};