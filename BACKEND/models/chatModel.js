const mongoose = require("mongoose");


const chatSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);


// Helps fetch a user's chats efficiently
chatSchema.index({
    user: 1,
    updatedAt: -1
});


module.exports = mongoose.model(
    "Chat",
    chatSchema
);