const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },

        role: {
            type: String,
            enum: [
                "user",
                "assistant"
            ],
            required: true
        },

        content: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "completed",
                "stopped"
            ],
            default: "completed"
        }
    },
    {
        timestamps: true
    }
);


// Optimizes conversation-history queries
messageSchema.index({
    chat: 1,
    createdAt: 1
});


module.exports = mongoose.model(
    "Message",
    messageSchema
);