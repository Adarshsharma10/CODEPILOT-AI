const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createMessage } = require("../controllers/messageController");

router.post("/", authMiddleware, createMessage);

module.exports = router;