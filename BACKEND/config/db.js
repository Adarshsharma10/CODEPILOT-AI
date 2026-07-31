const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error(
                "MONGO_URI is missing from the .env file"
            );
        }

        await mongoose.connect(mongoURI);

        console.log("MongoDB Connected");

    } catch (error) {

        console.error(
            "MongoDB Connection Error:",
            error.message
        );

        process.exit(1);
    }
};

module.exports = connectDB;