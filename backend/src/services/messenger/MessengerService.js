const Messenger = require("../../models/messenger/Messenger");
const mongoose = require("mongoose");

const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const createMessage = async (payload) => Messenger.create(payload);

const getMessageById = async (id) => {
  const msg = await Messenger.findOne({ _id: id, deleted_at: null })
    .populate("sender")
    .populate("recipient");
  if (!msg) throw buildError("Message introuvable", 404);
  return msg;
};

const updateMessage = async (id, payload) => {
  const msg = await Messenger.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );
  if (!msg) throw buildError("Message introuvable", 404);
  return msg;
};

const deleteMessage = async (id) => {
  const msg = await Messenger.findOne({ _id: id, deleted_at: null });
  if (!msg) throw buildError("Message introuvable", 404);
  msg.deleted_at = new Date();
  await msg.save();
  return msg;
};


const getConversation = async (senderId, recipientId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const messages = await Messenger.find({
    deleted_at: null,
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId }
    ]
  })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  return messages;
};

const getUsersWithLastMessage = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId); 

  const conversations = await Messenger.aggregate([
    {
      $match: {
        deleted_at: null,
        $or: [{ sender: userObjectId }, { recipient: userObjectId }]
      }
    },
    {
      $project: {
        message: 1,
        sender: 1,
        recipient: 1,
        created_at: 1,
        otherUser: {
          $cond: [
            { $eq: ["$sender", userObjectId] }, 
            "$recipient",
            "$sender"
          ]
        }
      }
    },
    { $sort: { created_at: -1 } },
    {
      $group: {
        _id: "$otherUser",
        lastMessage: { $first: "$$ROOT" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        user: 1,
        lastMessage: 1
      }
    }
  ]);

  return conversations;
};

module.exports = {
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
  getConversation,
  getUsersWithLastMessage
};
