// routes/messenger/MessengerRoute.js
const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/messenger/MessengerController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);


router.get("/unread-count", ctrl.getUnreadCount);


router.post("/", ctrl.createMessage);
router.post("/contacts/mark-as-read", ctrl.markConversationAsRead);
router.get("/contacts/conversation", ctrl.getConversation);


router.get("/contacts/last-message", ctrl.getUsersWithLastMessage);

router.get("/:id", ctrl.getMessageById);
router.put("/:id", ctrl.updateMessage);
router.delete("/:id", ctrl.deleteMessage);

module.exports = router;
