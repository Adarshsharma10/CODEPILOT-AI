
require("dotenv").config();
console.log("Server file started");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const connectDB = require("./config/db");
const express = require("express");    //IMPORT THE EXPRESS LIBRARRY
const app = express();   // Creates your Express Application
connectDB();
const PORT = process.env.PORT;

//Middleware
app.use(express.json());

app.get("/", (req,res) => {
    res.send("Welcome to CodePilot AI");
});

app.get("/about", (req,res) => {
    res.send("This is the About Page");
});

app.get("/login", (req,res) => {
    res.send("Login Page");
});

app.get("/register", (req,res) => {
    res.send("Register Page");
});

app.use("/api/users", userRoutes);   //connect all user routes


app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});