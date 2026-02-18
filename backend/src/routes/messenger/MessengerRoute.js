// routes/messenger/MessengerRoute.js
const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/messenger/MessengerController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);


router.post("/", ctrl.createMessage);
router.get("/:id", ctrl.getMessageById);
router.put("/:id", ctrl.updateMessage);
router.delete("/:id", ctrl.deleteMessage);


router.get("/contacts/conversation", ctrl.getConversation);


router.get("/contacts/last-message", ctrl.getUsersWithLastMessage);

module.exports = router;
