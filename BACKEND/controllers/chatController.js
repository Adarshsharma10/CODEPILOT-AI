const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");


// ==========================================
// CREATE CHAT
// ==========================================

const createChat = async (req, res) => {
    try {
        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (title.length > 100) {
            return res.status(400).json({
                message: "Title cannot exceed 100 characters"
            });
        }

        const chat = await Chat.create({
            title,
            user: req.user.id
        });

        return res.status(201).json({
            message: "Chat created successfully",
            chat
        });

    } catch (error) {
        console.error(
            "Create Chat Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to create chat"
        });
    }
};


// ==========================================
// GET ALL CHATS
// ==========================================

const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user.id
        }).sort({
            updatedAt: -1
        });

        return res.status(200).json(chats);

    } catch (error) {
        console.error(
            "Get Chats Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to get chats"
        });
    }
};


// ==========================================
// GET CHAT BY ID
// ==========================================

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

        return res.status(200).json(chat);

    } catch (error) {

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid chat ID"
            });
        }

        console.error(
            "Get Chat Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to get chat"
        });
    }
};


// ==========================================
// UPDATE / RENAME CHAT
// ==========================================

const updateChat = async (req, res) => {
    try {
        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (title.length > 100) {
            return res.status(400).json({
                message: "Title cannot exceed 100 characters"
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

        return res.status(200).json({
            message: "Chat updated successfully",
            chat
        });

    } catch (error) {

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid chat ID"
            });
        }

        console.error(
            "Update Chat Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to update chat"
        });
    }
};


// ==========================================
// DELETE CHAT
// ==========================================

const deleteChat = async (req, res) => {
    try {
        /*
            Ownership is checked here.

            A user can only delete a chat
            belonging to their own account.
        */

        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }


        // Delete all messages belonging to the chat
        await Message.deleteMany({
            chat: chat._id
        });


        // Delete the chat itself
        await Chat.deleteOne({
            _id: chat._id
        });


        return res.status(200).json({
            message: "Chat deleted successfully"
        });

    } catch (error) {

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid chat ID"
            });
        }

        console.error(
            "Delete Chat Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to delete chat"
        });
    }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    createChat,
    getChats,
    getChatById,
    updateChat,
    deleteChat
};