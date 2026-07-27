const express = require("express");
const router = express.Router();

const {
    createChat,
    getChats,
    getChatById
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createChat);
router.get("/", authMiddleware, getChats);
router.get("/:id", authMiddleware, getChatById);

module.exports = router;