const express = require("express");
const router = express.Router();

const {
    createChat,
    getChats,
    getChatById,
    updateChat,
    deleteChat
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChat);

router.get("/", authMiddleware, getChats);

router.get("/:id", authMiddleware, getChatById);

router.put("/:id", authMiddleware, updateChat);

router.delete("/:id", authMiddleware, deleteChat);

module.exports = router;