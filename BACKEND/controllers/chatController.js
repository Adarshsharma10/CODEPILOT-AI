const Chat = require("../models/chatModel");

const createChat = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const chat = await Chat.create({
            title,
            user: req.user.id
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json(chats);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        res.status(200).json(chat);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createChat,
    getChats,
    getChatById
};