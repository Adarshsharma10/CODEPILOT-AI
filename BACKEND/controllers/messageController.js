const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const { generateResponse } = require("../services/geminiService");

const createMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;

        if (!chatId || !content) {
            return res.status(400).json({
                message: "Chat ID and content are required"
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        const message = await Message.create({
            chat: chatId,
            role: "user",
            content
        });

        let aiReply;

        try {
            aiReply = await generateResponse(content);
        } catch (error) {
            aiReply = "Sorry, I couldn't generate a response right now.";
        }

        const assistantMessage = await Message.create({
            chat: chatId,
            role: "assistant",
            content: aiReply
        });

        res.status(201).json({
            success: true,
            userMessage: message,
            assistantMessage
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMessages = async (req, res) => {

    const { chatId } = req.params;

    const chat = await Chat.findOne({
        _id: chatId,
        user: req.user.id
    });

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        });
    }

    const messages = await Message.find({
        chat: chatId
    }).sort({
        createdAt: 1
    });

    res.status(200).json(messages);
};
module.exports = {
    createMessage,
    getMessages
};