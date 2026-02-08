const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Role = require("../models/Role");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    return null;
  }

  const tlsRejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(tlsRejectUnauthorized === "false"
      ? { tls: { rejectUnauthorized: false } }
      : {})
  });
};

const sendVerificationEmail = async (email, code) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`Code de verification pour ${email}: ${code}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Verification de votre email",
    text: `Votre code de verification est: ${code}`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #f8fafc; padding: 28px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 28px; border: 1px solid #f1f5f9; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-weight: 900; font-size: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);">K</div>
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.1;">KORUS <span style=\"color:#f59e0b;\">Center</span></div>
              <div style="font-size: 12px; color: #94a3b8;">Verification de compte</div>
            </div>
          </div>
          <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px;">Verification de votre email</h2>
          <p style="margin: 0 0 16px; color: #334155;">Bonjour,</p>
          <p style="margin: 0 0 16px; color: #334155;">Saisissez ce code pour confirmer votre adresse email :</p>
          <div style="font-size: 28px; letter-spacing: 6px; font-weight: 800; color: #0f172a; background: #f8fafc; padding: 12px 16px; text-align: center; border-radius: 12px; border: 1px solid #f1f5f9;">${code}</div>
          <p style="margin: 16px 0 0; color: #94a3b8;">Ce code expire dans 10 minutes.</p>
        </div>
      </div>
    `
  });
};

const issueVerificationCode = async (user) => {
  const code = generateVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.email_verification_code = codeHash;
  user.email_verification_expires = expiresAt;
  await user.save();

  await sendVerificationEmail(user.email, code);
};

const registerAcheteur = async (payload) => {
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();
  const email = payload.email?.trim().toLowerCase();
  const phone = payload.phone?.trim();
  const password = payload.password;
  const adresse = payload.adresse?.trim() || "";

  if (!firstName || !lastName || !email || !phone || !password) {
    throw buildError("Champs obligatoires manquants", 400);
  }

  const role = await Role.findOne({
    $or: [{ val: /^acheteur$/i }, { val: /^user$/i }]
  });

  if (!role) {
    throw buildError("Role acheteur introuvable", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw buildError("Email deja utilise", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`.trim();

  const user = await User.create({
    name,
    email,
    phone,
    adresse,
    password: hashed,
    role: role._id,
    is_verified: false
  });

  await issueVerificationCode(user);

  return { userId: user._id, email: user.email };
};

const mapRoleValue = (roleDoc) => {
  const value = roleDoc?.val?.toLowerCase() || "";
  if (value.includes("admin")) return "ADMIN";
  if (value.includes("boutique")) return "BOUTIQUE";
  if (value.includes("acheteur") || value.includes("user")) return "ACHETEUR";
  return value.toUpperCase() || "USER";
};

const buildTokens = async (user) => {
  const roleValue = mapRoleValue(user.role);
  const accessToken = jwt.sign(
    { role: roleValue },
    JWT_SECRET,
    { subject: user._id.toString(), expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { type: "refresh" },
    JWT_REFRESH_SECRET,
    { subject: user._id.toString(), expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  const refreshHash = await bcrypt.hash(refreshToken, 10);
  user.refresh_token_hash = refreshHash;
  await user.save();

  return { accessToken, refreshToken, roleValue };
};

const login = async (payload) => {
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    throw buildError("Champs obligatoires manquants", 400);
  }

  const user = await User.findOne({ email }).populate("role");
  if (!user) {
    throw buildError("Email ou mot de passe incorrect", 401);
  }

  const match = await bcrypt.compare(password, user.password || "");
  if (!match) {
    throw buildError("Email ou mot de passe incorrect", 401);
  }

  if (!user.is_verified) {
    throw buildError("Email non verifie", 403);
  }

  const { accessToken, refreshToken, roleValue } = await buildTokens(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: roleValue,
      createdAt: user.created_at,
      lastLoginAt: new Date()
    }
  };
};

const refreshAccessToken = async (payload) => {
  const refreshToken = payload.refreshToken;
  if (!refreshToken) {
    throw buildError("Refresh token manquant", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    throw buildError("Refresh token invalide", 401);
  }

  const user = await User.findById(decoded.sub).populate("role");
  if (!user || !user.refresh_token_hash) {
    throw buildError("Refresh token invalide", 401);
  }

  const match = await bcrypt.compare(refreshToken, user.refresh_token_hash);
  if (!match) {
    throw buildError("Refresh token invalide", 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = await buildTokens(user);
  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (payload) => {
  const refreshToken = payload.refreshToken;
  if (!refreshToken) {
    throw buildError("Refresh token manquant", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    throw buildError("Refresh token invalide", 401);
  }

  const user = await User.findById(decoded.sub);
  if (user) {
    user.refresh_token_hash = null;
    await user.save();
  }

  return { success: true };
};

const verifyEmailCode = async (payload) => {
  const userId = payload.userId;
  const code = payload.code?.trim();

  if (!userId || !code) {
    throw buildError("Champs obligatoires manquants", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw buildError("Utilisateur introuvable", 404);
  }

  if (!user.email_verification_code || !user.email_verification_expires) {
    throw buildError("Code de verification manquant", 400);
  }

  if (user.email_verification_expires < new Date()) {
    throw buildError("Code de verification expire", 400);
  }

  const isMatch = await bcrypt.compare(code, user.email_verification_code);
  if (!isMatch) {
    throw buildError("Code invalide", 400);
  }

  user.is_verified = true;
  user.email_verification_code = null;
  user.email_verification_expires = null;
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return safeUser;
};

const resendVerificationCode = async (payload) => {
  const userId = payload.userId;
  const email = payload.email?.trim().toLowerCase();

  if (!userId && !email) {
    throw buildError("Champs obligatoires manquants", 400);
  }

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email });

  if (!user) {
    throw buildError("Utilisateur introuvable", 404);
  }

  if (user.is_verified) {
    throw buildError("Email deja verifie", 400);
  }

  await issueVerificationCode(user);

  return { userId: user._id, email: user.email };
};

module.exports = {
  registerAcheteur,
  login,
  refreshAccessToken,
  logout,
  verifyEmailCode,
  resendVerificationCode
};
