const userService = require("../../services/user/userService");
const UserExportService = require("../../services/user/UserExportService");

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
exports.getProprietaire = async (req, res) => {
  try {
    const users = await userService.getProprietaire();
    res.json(users);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUsersPourGestionAdmin = async (req, res) => {
  try {
    const users = await userService.getUserPourGestionAdmin();
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

exports.reactiverUser = async (req, res) => {
  try {
    let { userId} = req.query;
    if(!userId) res.status(400).json({ message: "User id is requiered" });
    const user = await userService.reactiverUser(userId);
    res.json(user);
  } catch (error) {
    console.error(error);
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

exports.exportUsersExcel = async (req, res) => {
  try {
    const users = await userService.getUsersForAdminExport();
    const workbook = await UserExportService.buildUsersWorkbook(users);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const filename = `utilisateurs_${yyyy}-${mm}-${dd}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
