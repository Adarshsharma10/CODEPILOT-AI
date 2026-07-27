const mongoose = require("mongoose");   // Import the Mongoose

const userSchema = new      // This creates a blueprint for everyuser.
mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User",userSchema);   // This creates the User Model

module.exports = User;     // This allows us to use the User model in other files