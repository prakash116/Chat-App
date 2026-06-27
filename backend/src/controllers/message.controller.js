import { getReceiverSocketIds, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    })
      .select("-password")
      .lean();

    const conversations = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    })
      .sort({ createdAt: -1 })
      .select("senderId receiverId createdAt")
      .lean();

    const lastMessageByUser = new Map();
    conversations.forEach((message) => {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();
      const peerId =
        senderId === loggedInUserId.toString() ? receiverId : senderId;

      if (!lastMessageByUser.has(peerId)) {
        lastMessageByUser.set(peerId, message.createdAt);
      }
    });

    filteredUsers.sort((first, second) => {
      const firstLastMessageAt = lastMessageByUser.get(first._id.toString());
      const secondLastMessageAt = lastMessageByUser.get(second._id.toString());

      if (!firstLastMessageAt && !secondLastMessageAt) {
        return first.fullName.localeCompare(second.fullName);
      }
      if (!firstLastMessageAt) {
        return 1;
      }
      if (!secondLastMessageAt) {
        return -1;
      }
      return secondLastMessageAt - firstLastMessageAt;
    });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message);
    res.status(500).json({ message: "Error in getUsersForSidebar", error });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessage", error.message);
    res.status(500).json({ message: "Error in getMessage", error });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const message = new Message({
      text,
      senderId,
      receiverId,
    });
    const savedMessage = await message.save();
    const receiverSocketIds = getReceiverSocketIds(receiverId);
    if (receiverSocketIds.length > 0) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessage", savedMessage);
      });
    }
    if (savedMessage) {
      return res.status(201).json(savedMessage);
    } else {
      return res.status(500).json({ message: "Failed to send message" });
    }
  } catch (error) {
    console.log("Error in sendMessage", error.message);
    res.status(500).json({ message: "Error in sendMessage", error });
  }
};
