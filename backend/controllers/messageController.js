import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientsSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

// Send Message
const sendMessage = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        let { img } = req.body;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            });

            await conversation.save();
        }

        if (img) { 
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            conversationId: conversation?._id,
            sender: senderId,
            text: message,
            img: img || "",
        });

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId,
                }
            })
        ]);

        const recipientSocketId = getRecipientsSocketId(recipientId)
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in sendMessage: ", err.message);
    }
};

// Get Message Between Two Users
const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 });

        if (!messages) {
            return res.status(404).json({ error: "Messages not found" });
        }

        res.status(200).json(messages);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getMessages: ", err.message);
    }
};

// Get Conversations
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ participants: userId }).populate({
            path: "participants",
            select: "username profilePic"
        });

        if (!conversations) {
            return res.status(404).json({ error: "Conversations not found" });
        }

        conversations.forEach(conversation => {
            conversation.participants = conversation.participants.filter(
                participant => participant._id.toString() !== userId.toString()
            );
        });
        res.status(200).json(conversations);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getConversations: ", err.message);
    }
};

export { sendMessage, getMessages, getConversations };