const User = require("../models/user/User");
const UserStatus = require("../models/user/UserStatus");
const buildError = require("../utils/buildError");

const checkSuspension = async (req, res, next) => {
  try {
    const now = new Date();

    const user = await User.findById(req.user.id)
      .populate("status");

    if (!user) {
      throw buildError("Utilisateur non trouvé", 404);
    }
    if (user.status.value === "Actif") {
      return next();
    }
    const activeSuspension = user.suspensions.find(s => {
      if (s.end_date === null) {
        return true;
      }
      return s.started_date <= now && s.end_date >= now;
    });

    if (activeSuspension) {

      if (activeSuspension.end_date === null) {
        throw buildError(
          "Compte suspendu pour une durée indéterminée",
          403
        );
      }
      throw buildError(
        `Compte suspendu jusqu'au ${activeSuspension.end_date}`,
        403
      );
    }
    const actifStatus = await UserStatus.findOne({ value: "Actif" });
    user.status = actifStatus._id;
    await user.save();
    next();

  } catch (error) {
    next(error);
  }
};

module.exports = checkSuspension;