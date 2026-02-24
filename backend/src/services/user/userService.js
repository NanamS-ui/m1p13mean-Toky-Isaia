const bcrypt = require("bcryptjs");
const User = require("../../models/user/User");
const Role = require("../../models/user/Role");
const UserStatus = require("../../models/user/UserStatus");
const { default: mongoose } = require("mongoose");
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

const getUsersForAdminExport = async () => {
  const now = new Date();
  const users = await User.find()
    .populate('role', 'val')
    .populate('status', 'value')
    .lean();

  return (users || []).map((u) => {
    const suspensions = Array.isArray(u.suspensions) ? u.suspensions : [];

    const activeSuspension = suspensions.find((s) => {
      if (!s) return false;
      const started = s.started_date ? new Date(s.started_date) : null;
      const end = s.end_date ? new Date(s.end_date) : null;
      if (!started || Number.isNaN(started.getTime())) return false;
      if (end === null) return started <= now;
      if (Number.isNaN(end.getTime())) return false;
      return started <= now && end >= now;
    });

    const loginHistory = Array.isArray(u.login_history) ? u.login_history : [];
    const lastLogin = loginHistory
      .map((h) => (h?.login_date ? new Date(h.login_date) : null))
      .filter((d) => d && !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    const lastLogout = loginHistory
      .map((h) => (h?.logout_date ? new Date(h.logout_date) : null))
      .filter((d) => d && !Number.isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      id: String(u._id),
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      adresse: u.adresse || '',
      role: u.role?.val || '',
      status: u.status?.value || '',
      is_verified: Boolean(u.is_verified),
      isSuspended: Boolean(activeSuspension),
      suspensionEndDate: activeSuspension?.end_date ? new Date(activeSuspension.end_date).toISOString() : activeSuspension ? null : '',
      created_at: u.created_at ? new Date(u.created_at).toISOString() : '',
      lastLoginAt: lastLogin ? lastLogin.toISOString() : '',
      lastLogoutAt: lastLogout ? lastLogout.toISOString() : '',
      suspensions,
      login_history: loginHistory
    };
  });
};
const getProprietaire = async ()=>{
  const roleBoutique = await Role.findOne({ val : "BOUTIQUE"});
  const user = await User.find({role : new mongoose.Types.ObjectId(roleBoutique._id)}).select("_id name email");
  return user;
}

const logoutUser = async (userID)=>{
  const now = new Date();
  const user = await User.findOne({_id : new mongoose.Types.ObjectId(userID)});
  if (!user) return;

  const lastSession = user.login_history
    .slice()
    .reverse()
    .find(h => h.logout_date == null);

  if (lastSession) {
    lastSession.logout_date = now;
  }
  // for(let i =0 ; user.login_history.length>i; i++){
  //   if(user.login_history[i].logout_date == null)
  //     user.login_history[i].logout_date = now;
  // }
  await user.save();
  return user;
}
const reactiverUser = async (userID)=>{
  const now = new Date();
  const actifStatus = await UserStatus.findOne({ value: "Actif" });
  const user = await User.findOne({_id : new mongoose.Types.ObjectId(userID)});
  if(user.status.equals(actifStatus._id)){
    return user;
  }
  user.status = actifStatus._id;
  for(let i =0 ; user.suspensions.length>i; i++){
    if(user.suspensions[i].started_date <= now && user.suspensions[i].end_date > now)
      user.suspensions[i].end_date = now;
    if(user.suspensions[i].end_date == null)
      user.suspensions[i].end_date = now;
  }
  await user.save();
  return user;
}
const getUserPourGestionAdmin = async()=>{
  let users = await User.aggregate([
    {$lookup: {from: "roles", let : {idRole : "$role" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idRole"]}}}, 
            {$project:{_id:1, val:1}}], as: "role"}},
          {$unwind: "$role"},
    {$lookup: {from: "user_status", let : {idStatus : "$status" },pipeline:[{$match: {$expr : {$eq: ["$_id","$$idStatus"]}}}, 
            {$project:{_id:1, value:1}}], as: "status"}},
          {$unwind: "$status"},
    {$addFields: {
        activeSuspension: {
          $first: {$filter: {input: "$suspensions",as: "s",
              cond: {$or: [{ $eq: ["$$s.end_date", null] },{$and: [{ $lte: ["$$s.started_date", new Date()] },{ $gte: ["$$s.end_date", new Date()] }]}]}
          }}
        }}},
    {$addFields: {isSuspended: { $cond: [{ $ifNull: ["$activeSuspension", false] }, true, false] },suspensionEndDate: "$activeSuspension.end_date"}},
    {$project: {
      _id:1, name:1, email:1, role:1, status:1, created_at: 1,isSuspended: 1,suspensionEndDate: 1
    }},
    {$sort: {
      created_at:-1
    }}
]);
  for(let i =0 ; users.length>i; i++){
    if(users[i].isSuspended && users[i].suspensionEndDate == null) await reactiverUser(users[i]._id)
  }
  return users;

}

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
  getUsersForAdminExport,
  getUserById,
  updateUser,
  deleteUser,
  getUserSuspensions,
  addUserSuspension,
  getUserLoginHistory,
  addUserLoginHistory,
  getUserPourGestionAdmin,
  reactiverUser,
  logoutUser,
  getProprietaire
};
