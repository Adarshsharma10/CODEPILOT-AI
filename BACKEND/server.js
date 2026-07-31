require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();


// ==========================================
// Database
// ==========================================

connectDB();


// ==========================================
// Middleware
// ==========================================

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // and requests from approved frontends
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(express.json());


// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        message: "CodePilot AI API is running"
    });
});


// ==========================================
// API Routes
// ==========================================

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);


// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});


// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server is running on http://localhost:${PORT}`
    );
});