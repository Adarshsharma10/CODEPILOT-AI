const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    createMessage,
    getMessages
} = require(
    "../controllers/messageController"
);


// Send message + stream AI response
router.post(
    "/",
    authMiddleware,
    createMessage
);


// Get conversation messages
router.get(
    "/:chatId",
    authMiddleware,
    getMessages
);


module.exports = router;