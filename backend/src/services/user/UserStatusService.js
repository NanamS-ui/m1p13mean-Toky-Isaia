const UserStatus = require("../../models/user/UserStatus");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const createUserStatus = async (payload) => {
  return await UserStatus.create(payload);
};

const getUserStatuses = async () => {
  return await UserStatus.find().sort({ created_at: -1 });
};

const getUserStatusById = async (id) => {
  const status = await UserStatus.findById(id);
  if (!status) throw buildError("User status introuvable", 404);
  return status;
};

const updateUserStatus = async (id, payload) => {
  const status = await UserStatus.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });

  if (!status) throw buildError("User status introuvable", 404);
  return status;
};

const deleteUserStatus = async (id) => {
  const status = await UserStatus.findByIdAndDelete(id);
  if (!status) throw buildError("User status introuvable", 404);
  return status;
};

module.exports = {
  createUserStatus,
  getUserStatuses,
  getUserStatusById,
  updateUserStatus,
  deleteUserStatus
};