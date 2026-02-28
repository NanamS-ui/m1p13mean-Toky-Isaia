const NotificationService = require("../../services/communication/NotificationService");

exports.createNotification = async (req, res) => {
  try {
    const notification = await NotificationService.createNotification(
      req.body,
      req.user.id
    );
    res.status(201).json(notification);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await NotificationService.getNotificationById(
      req.params.id
    );
    res.json(notification);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getNotificationsForUser(
      req.user.id
    );
    res.json(notifications);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    res.json({ message: "Notification marquée comme lue", notification });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    res.json({ message: "Toutes les notifications marquées comme lues", result });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await NotificationService.deleteNotification(
      req.params.id
    );
    res.json({ message: "Notification supprimée", notification });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};
