const Notification = require("../../models/communication/Notification");
const User = require("../../models/user/User");
const Role = require("../../models/user/Role");
const mongoose = require("mongoose");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createNotification = async (payload, senderId) => {
  const { title, message, target, recipients } = payload;

  if (!title || !message) {
    throw buildError("Titre et message sont requis", 400);
  }

  if (!["all", "acheteurs", "boutiques", "custom"].includes(target)) {
    throw buildError("Cible invalide", 400);
  }

  // Déterminer les destinataires selon la cible
  let recipientList = [];
  if (target === "custom") {
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw buildError("Veuillez sélectionner au moins un utilisateur", 400);
    }
    recipientList = recipients;
  } else if (target === "all") {
    const users = await User.find({ is_deleted: null }).select("_id");
    recipientList = users.map(u => u._id);
  } else if (target === "acheteurs") {
    // Récupérer le rôle ACHETEUR
    const acheteurRole = await Role.findOne({ val: "ACHETEUR" });
    if (acheteurRole) {
      const users = await User.find({ role: acheteurRole._id, is_deleted: null }).select("_id");
      recipientList = users.map(u => u._id);
    }
  } else if (target === "boutiques") {
    // Récupérer le rôle PROPRIETAIRE
    const proprietaireRole = await Role.findOne({ val: "PROPRIETAIRE" });
    if (proprietaireRole) {
      const users = await User.find({ role: proprietaireRole._id, is_deleted: null }).select("_id");
      recipientList = users.map(u => u._id);
    }
  }

  // Si recipients est fourni et c'est un tableau, l'utiliser à la place
  if (target !== "custom" && recipients && Array.isArray(recipients) && recipients.length > 0) {
    recipientList = recipients;
  }

  const notification = await Notification.create({
    title,
    message,
    target,
    recipients: recipientList,
    sent_by: senderId,
    is_sent: true,
    sent_at: new Date()
  });

  return notification.populate("sent_by", "name email");
};

const getNotifications = async () => {
  return Notification.find()
    .populate("sent_by", "name email")
    .populate("recipients", "name email")
    .sort({ created_at: -1 });
};

const getNotificationById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError("ID invalide", 400);
  }

  const notification = await Notification.findById(id)
    .populate("sent_by", "name email")
    .populate("recipients", "name email");

  if (!notification) {
    throw buildError("Notification introuvable", 404);
  }

  return notification;
};

const getNotificationsForUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("ID utilisateur invalide", 400);
  }

  const notifications = await Notification.find({
    recipients: userId,
    is_sent: true
  })
    .populate("sent_by", "name email")
    .sort({ created_at: -1 });

  // Ajouter le statut de lecture pour l'utilisateur actuel
  return notifications.map(notif => ({
    ...notif.toObject(),
    isRead: notif.read_by?.some(r => r.user?.toString() === userId.toString()) ?? false
  }));
};

const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw buildError("ID notification invalide", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("ID utilisateur invalide", 400);
  }

  // Vérifier que l'utilisateur est destinataire
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw buildError("Notification introuvable", 404);
  }

  if (!notification.recipients.includes(userId)) {
    throw buildError("L'utilisateur n'est pas destinataire de cette notification", 403);
  }

  // Vérifier si déjà marqué comme lu
  const alreadyRead = notification.read_by?.some(r => r.user?.toString() === userId.toString());
  if (alreadyRead) {
    return notification.populate("sent_by", "name email");
  }

  // Marquer comme lu
  const updatedNotification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      $addToSet: {
        read_by: {
          user: userId,
          read_at: new Date()
        }
      }
    },
    { new: true }
  ).populate("sent_by", "name email");

  return updatedNotification;
};

const markAllAsRead = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("ID utilisateur invalide", 400);
  }

  try {
    // Marquer toutes les notifications non-lues de l'utilisateur comme lues
    const result = await Notification.updateMany(
      {
        recipients: userId,
        is_sent: true,
        "read_by.user": { $ne: userId }
      },
      {
        $addToSet: {
          read_by: {
            user: userId,
            read_at: new Date()
          }
        }
      }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} notification(s) marquee(s) comme lue(s)`
    };
  } catch (error) {
    throw buildError("Erreur lors du marquage des notifications", 500);
  }
};

const getUnreadCount = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("ID utilisateur invalide", 400);
  }

  const count = await Notification.countDocuments({
    recipients: userId,
    is_sent: true,
    "read_by.user": { $ne: userId }
  });

  return count;
};

const deleteNotification = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError("ID invalide", 400);
  }

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    throw buildError("Notification introuvable", 404);
  }

  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};
