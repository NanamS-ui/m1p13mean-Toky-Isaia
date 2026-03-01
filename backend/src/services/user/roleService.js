const Role = require("../../models/user/Role");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createRole = async (payload) => Role.create(payload);

const getRoles = async () => Role.find();

const getRoleById = async (id) => {
  const role = await Role.findById(id);
  if (!role) throw buildError("Role introuvable", 404);
  return role;
};

const updateRole = async (id, payload) => {
  const role = await Role.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });
  if (!role) throw buildError("Role introuvable", 404);
  return role;
};

const deleteRole = async (id) => {
  const role = await Role.findByIdAndDelete(id);
  if (!role) throw buildError("Role introuvable", 404);
  return role;
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
};
