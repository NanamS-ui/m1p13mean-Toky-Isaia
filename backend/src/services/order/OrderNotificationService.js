const Notification = require("../../models/communication/Notification");
const Order = require("../../models/order/Order");
const OrderCategory = require("../../models/order/OrderCategory");
const mongoose = require("mongoose");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Messages de notification selon le statut de la commande
 */
const statusMessages = {
  "En attente": {
    title: "Nouvelle commande reçue! 📦",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été reçue. Nous vérifions actuellement les détails et reviendrons vers vous bientôt.`
  },
  "Confirmée": {
    title: "Commande confirmée! ✅",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été confirmée et le paiement a été reçu. Préparation en cours!`
  },
  "En préparation": {
    title: "Commande en cours de préparation 📦",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} est actuellement en préparation. Elle sera bientôt prête pour l'expédition.`
  },
  "Livrée": {
    title: "Commande livrée! 🎉",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été livrée avec succès! Merci pour votre achat.`
  },
  "Annulée": {
    title: "Commande annulée ❌",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été annulée. Si vous avez des questions, veuillez nous contacter.`
  }
};

/**
 * Envoie une notification à l'acheteur lors d'un changement de statut
 * @param {string} orderId - ID de la commande
 * @param {string} newStatus - Nouveau statut de la commande
 * @param {string} shopOwnerId - ID du propriétaire de la boutique (pour vérification)
 */
const sendOrderStatusNotification = async (orderId, newStatus, shopOwnerId = null) => {
  try {
    // Vérifier que la commande existe
    const order = await Order.findById(orderId)
      .populate("buyer", "name email _id")
      .populate({
        path: "orderItems",
        populate: {
          path: "stock",
          populate: {
            path: "shop",
            select: "owner"
          }
        }
      });

    if (!order) {
      throw buildError("Commande introuvable", 404);
    }

    // Récupérer les données de message
    const messageData = statusMessages[newStatus];
    if (!messageData) {
      console.warn(`Pas de message de notification configuré pour le statut: ${newStatus}`);
      return null;
    }

    // Déterminer l'expéditeur (premier shop owner, ou le fourni)
    let senderId = shopOwnerId;
    if (!senderId && order.orderItems && order.orderItems.length > 0) {
      senderId = order.orderItems[0]?.stock?.shop?.owner;
    }

    // Créer la notification
    const notification = await Notification.create({
      title: messageData.title,
      message: messageData.message(order._id.toString().substring(0, 8), order.buyer.name),
      target: "acheteurs", // Notification pour les acheteurs spécifiquement
      recipients: [order.buyer._id], // Adressée uniquement à cet acheteur
      sent_by: senderId || null, // Envoyée par la boutique (optionnel)
      is_sent: true,
      sent_at: new Date(),
      order_id: orderId, // Référence à la commande
      order_status: newStatus
    });

    // Populate l'expéditeur
    await notification.populate("sent_by", "name email");

    console.log(`Notification d'ordre envoyée: ${notification._id} pour commande ${orderId}`);
    return notification;

  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification de commande:", error);
    // Ne pas lever l'erreur pour ne pas bloquer la mise à jour de la commande
    return null;
  }
};

/**
 * Crée les notifications pour tous les acheteurs intéressés (notifications system-wide)
 * @param {string} newStatus - Nouveau statut
 */
const sendBroadcastStatusNotification = async (newStatus) => {
  try {
    if (!statusMessages[newStatus]) {
      console.warn(`Pas de message de broadcast pour le statut: ${newStatus}`);
      return null;
    }

    const messageData = statusMessages[newStatus];

    const notification = await Notification.create({
      title: `📢 ${messageData.title}`,
      message: "Une nouvelle fonctionnalité ou mise à jour est disponible sur Korus Marketplace.",
      target: "acheteurs", // Broadcast à tous les acheteurs
      recipients: [], // Laissé vide, sera rempli par le système
      is_sent: true,
      sent_at: new Date()
    });

    return notification;

  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification broadcast:", error);
    return null;
  }
};

module.exports = {
  sendOrderStatusNotification,
  sendBroadcastStatusNotification,
  statusMessages
};
