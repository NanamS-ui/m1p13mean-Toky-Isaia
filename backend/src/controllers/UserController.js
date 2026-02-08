const userService = require("../services/userService");

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "Utilisateur supprime" });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getUserSuspensions = async (req, res) => {
  try {
    const suspensions = await userService.getUserSuspensions(req.params.id);
    res.json(suspensions);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.addUserSuspension = async (req, res) => {
  try {
    const suspensions = await userService.addUserSuspension(
      req.params.id,
      req.body
    );
    res.status(201).json(suspensions);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getUserLoginHistory = async (req, res) => {
  try {
    const history = await userService.getUserLoginHistory(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.addUserLoginHistory = async (req, res) => {
  try {
    const history = await userService.addUserLoginHistory(
      req.params.id,
      req.body
    );
    res.status(201).json(history);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
