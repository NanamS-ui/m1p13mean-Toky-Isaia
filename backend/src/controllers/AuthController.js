const authService = require("../services/authService");

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");
    res.json({
      id: user._id,
      email: user.email,
      firstName,
      lastName,
      phone: user.phone || "",
      adresse: user.adresse || "",
      role: req.user.role
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const user = await authService.updateMe(req.user.id, req.body);
    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");
    res.json({
      id: user._id,
      email: user.email,
      firstName,
      lastName,
      phone: user.phone || "",
      adresse: user.adresse || "",
      role: req.user.role
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.registerAcheteur = async (req, res) => {
  try {
    const user = await authService.registerAcheteur(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const data = await authService.refreshAccessToken(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const data = await authService.logout(req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await authService.verifyEmailCode(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const result = await authService.resendVerificationCode(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    res.json({ success: true });
  } catch (error) {
    const status = error.status || 400;
    const message = error.message || "Erreur lors du changement de mot de passe";
    res.status(status).json({ message });
  }
};
