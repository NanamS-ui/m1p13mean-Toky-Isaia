updateStatus(orderId: string, newStatus: string): void {
  const category = this.orderCategories.find(o => o.value === newStatus);
  
  this.orderService.updateOrder(orderId, {
    orderCategory: category._id
  }).subscribe({
    next: () => {
      // Statut mis à jour
      // ✨ Une notification est envoyée automatiquement au backend!
    }
  });
}

exports.updateOrder = async (req, res) => {
  try {
    // Appelle le service
    const order = await OrderService.updateOrder(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};


const updateOrder = async (id, payload) => {
  // Récupère l'ancien statut AVANT la mise à jour
  const oldOrder = await Order.findOne({ _id: id }).populate("orderCategory");
  const oldStatus = oldOrder?.orderCategory?.value;
  
  // Met à jour la commande
  const order = await Order.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );

  if (payload && Object.prototype.hasOwnProperty.call(payload, "orderCategory")) {
    const category = await OrderCategory.findById(order.orderCategory).select("value");
    const categoryValue = category?.value;

    if (oldStatus !== categoryValue && categoryValue) {
      try {
        await OrderNotificationService.sendOrderStatusNotification(
          id,
          categoryValue
        );
      } catch (notifError) {
        console.error("Erreur notification:", notifError);
        // N'affecte pas la mise à jour de la commande
      }
    }
  }

  return order;
};

// ============================================================
// ÉTAPE 4: LE SERVICE DE NOTIFICATION CRÉE LE MESSAGE
// ============================================================

const statusMessages = {
  "En attente": {
    title: "Nouvelle commande reçue! 📦",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été reçue...`
  },
  "Confirmée": {
    title: "Commande confirmée! ✅",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été confirmée...`
  },
  "En préparation": {
    title: "Commande en cours de préparation 📦",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} est en préparation...`
  },
  "Livrée": {
    title: "Commande livrée! 🎉",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été livrée!...`
  },
  "Annulée": {
    title: "Commande annulée ❌",
    message: (orderNum, buyerName) => 
      `Bonjour ${buyerName}, votre commande #${orderNum} a été annulée...`
  }
};

// ============================================================
// ÉTAPE 5: LA NOTIFICATION EST CRÉÉE DANS LA BASE DE DONNÉES
// ============================================================

const sendOrderStatusNotification = async (orderId, newStatus) => {
  // Charge la commande et l'acheteur
  const order = await Order.findById(orderId).populate("buyer", "name email _id");

  if (!order) return null;

  // Récupère le message pour ce statut
  const messageData = statusMessages[newStatus];

  // Crée la notification
  const notification = await Notification.create({
    title: messageData.title,  // "Commande confirmée! ✅"
    message: messageData.message(
      order._id.toString().substring(0, 8),  // ID court
      order.buyer.name                        // "Marie"
    ),
    target: "acheteurs",                      // Notification pour acheteurs
    recipients: [order.buyer._id],            // Envoyer à cet acheteur UNIQUEMENT
    sent_by: shopOwnerId,                    // La boutique qui envoie
    is_sent: true,
    sent_at: new Date(),
    order_id: orderId,                        // Lien vers la commande
    order_status: newStatus                   // Statut au moment de l'envoi
  });

  return notification;
};