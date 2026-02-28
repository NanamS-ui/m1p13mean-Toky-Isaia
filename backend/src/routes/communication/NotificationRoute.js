const express = require("express");
const router = express.Router();
const NotificationCtrl = require("../../controllers/communication/NotificationController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

// Routes protégées - nécessitent une authentification
router.use(requireAuth);

// Routes pour l'utilisateur
router.get("/my", NotificationCtrl.getMyNotifications);
router.get("/unread/count", NotificationCtrl.getUnreadCount);
router.post("/:id/read", NotificationCtrl.markAsRead);
router.post("/read/all", NotificationCtrl.markAllAsRead);

// Routes pour les administrateurs uniquement
router.get("/", requireRole("ADMIN"), NotificationCtrl.getNotifications);
router.get("/:id", requireRole("ADMIN"), NotificationCtrl.getNotificationById);
router.post("/", requireRole("ADMIN"), NotificationCtrl.createNotification);
router.delete("/:id", requireRole("ADMIN"), NotificationCtrl.deleteNotification);

module.exports = router;
