// Marquer tous les messages reçus comme lus
exports.markConversationAsRead = async (req, res) => {
  try {
    const { recipientId } = req.body;
    await MessengerService.markConversationAsRead(req.user.id, recipientId);
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

const MessengerService = require("../../services/messenger/MessengerService");

exports.createMessage = async (req, res) => {
  try {
    const msg = await MessengerService.createMessage({
      ...req.body,
      sender: req.user.id 
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const msg = await MessengerService.getMessageById(req.params.id);
    res.json(msg);
  } catch (err) {
    res.status(err.status || 404).json({ message: err.message });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const msg = await MessengerService.updateMessage(req.params.id, req.body);
    res.json(msg);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await MessengerService.deleteMessage(req.params.id);
    res.json({ message: "Message supprimé" });
  } catch (err) {
    res.status(err.status || 404).json({ message: err.message });
  }
};


exports.getConversation = async (req, res) => {
  try {
    const { recipientId, page, limit } = req.query;
    const messages = await MessengerService.getConversation(req.user.id, recipientId, parseInt(page) || 1, parseInt(limit) || 20);
    res.json(messages);
  } catch (err) {
    
    res.status(err.status || 400).json({ message: err.message });
  }
};


exports.getUsersWithLastMessage = async (req, res) => {
  try {
    const conversations = await MessengerService.getUsersWithLastMessage(req.user.id);
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await MessengerService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ message: err.message });
  }
};
