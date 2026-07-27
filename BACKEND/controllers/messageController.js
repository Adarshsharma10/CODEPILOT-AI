const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

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

        res.status(201).json({
            message: "Message created successfully",
            data: message
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createMessage
};