const bcrypt = require("bcryptjs");
const User = require("../../models/user/User");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const prepareUserPayload = async (payload) => {
  const data = { ...payload };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return data;
};

const createUser = async (payload) => {
  const data = await prepareUserPayload(payload);
  return User.create(data);
};

const getUsers = async () => User.find();

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user;
};

const updateUser = async (id, payload) => {
  const data = await prepareUserPayload(payload);
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user;
};

const getUserSuspensions = async (id) => {
  const user = await User.findById(id).select("suspensions");
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user.suspensions || [];
};

const addUserSuspension = async (id, payload) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $push: { suspensions: payload } },
    { new: true, runValidators: true }
  ).select("suspensions");
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user.suspensions;
};

const getUserLoginHistory = async (id) => {
  const user = await User.findById(id).select("login_history");
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user.login_history || [];
};

const addUserLoginHistory = async (id, payload) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $push: { login_history: payload } },
    { new: true, runValidators: true }
  ).select("login_history");
  if (!user) throw buildError("Utilisateur introuvable", 404);
  return user.login_history;
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserSuspensions,
  addUserSuspension,
  getUserLoginHistory,
  addUserLoginHistory
};
