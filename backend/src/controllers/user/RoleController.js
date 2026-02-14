const roleService = require("../../services/user/roleService");

exports.createRole = async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await roleService.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.json(role);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.json({ message: "Role supprime" });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
