const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
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

const updateChat = async (req, res) => {
    try {

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        chat.title = title;

        await chat.save();

        res.status(200).json({
            message: "Chat updated successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteChat = async (req, res) => {
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

        await Message.deleteMany({
            chat: chat._id
        });

        await Chat.findByIdAndDelete(chat._id);

        res.status(200).json({
            message: "Chat deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createChat,
    getChats,
    getChatById,
    updateChat,
    deleteChat
};