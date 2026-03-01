// Marquer tous les messages reçus comme lus dans une conversation
const markConversationAsRead = async (userId, otherUserId) => {
  await Messenger.updateMany(
    {
      recipient: userId,
      sender: otherUserId,
      read: false,
      deleted_at: null
    },
    { $set: { read: true } }
  );
};
const Messenger = require("../../models/messenger/Messenger");
const mongoose = require("mongoose");
const User = require("../../models/user/User")
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
  }).sort({ created_at: 1 });

  return messages;
};

const getUsersWithLastMessage = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId); 
  const conversations = await User.aggregate([
  { $match: { _id: { $ne: userObjectId } } },
  {
    $lookup: {
      from: "messengers",
      let: { other_id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $and: [ { $eq: ["$sender", "$$other_id"] }, { $eq: ["$recipient", userObjectId] } ] },
                { $and: [ { $eq: ["$sender", userObjectId] }, { $eq: ["$recipient", "$$other_id"] } ] }
              ]
            }
          }
        },
        { $sort: { _id: -1 } },  
        { $limit: 1 }            
      ],
      as: "lastMessage"
    }
  },
  { $sort: { "lastMessage.created_date": -1 } },
  {$project: {
    _id:1, name:1,phone:1, email:1,lastMessage:1
  }}
]);

//   const conversations = await Messenger.aggregate([
//   {$match: {deleted_at: null,$or: [{ sender: userObjectId }, { recipient:  userObjectId}]}},
//   {$addFields: {
//     otherUser: {$cond: [{ $eq: ["$sender", userObjectId] }, "$recipient","$sender"]}
//   }},
//   {$lookup: {
//     from: "users",let : {otherId : "$otherUser"},
//     pipeline:[{$match:{$expr:{$eq:['$_id',"$$otherId"]}}},{$project:{_id:1, name:1}}],
//     as: "otherUser"}},
//   {$unwind: "$otherUser"},{ $sort: { created_at: 1 } },
//   {$group: {_id: "$otherUser._id",lastMessage: { $last: "$$ROOT" }}},
  
// ]);

  return conversations;
};

const getUnreadCount = async (userId) => {
  const count = await Messenger.countDocuments({
    recipient: userId,
    read: false,
    deleted_at: null
  });
  return count;
};

module.exports = {
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
  getConversation,
  getUsersWithLastMessage,
  markConversationAsRead,
  getUnreadCount
};
