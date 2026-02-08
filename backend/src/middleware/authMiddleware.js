const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  const userRole = req.user?.role;
  if (!userRole) {
    return res.status(403).json({ message: "Acces interdit" });
  }
  if (!roles.includes(userRole)) {
    return res.status(403).json({ message: "Acces interdit" });
  }
  return next();
};

module.exports = {
  requireAuth,
  requireRole
};
