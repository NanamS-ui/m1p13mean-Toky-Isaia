const authService = require("../services/authService");

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
