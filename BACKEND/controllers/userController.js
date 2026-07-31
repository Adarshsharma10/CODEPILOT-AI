const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");


// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Register User Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        return res.status(500).json({
            message: "Unable to register user"
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Login User Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to login"
        });
    }
};


// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(
            req.user.id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error(
            "Get Profile Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to get profile"
        });
    }
};


// ==========================================
// UPDATE PROFILE
// ==========================================

const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        if (email !== undefined) {
            if (!email.trim()) {
                return res.status(400).json({
                    message: "Email cannot be empty"
                });
            }

            const normalizedEmail =
                email.toLowerCase().trim();

            const existingUser =
                await User.findOne({
                    email: normalizedEmail,

                    _id: {
                        $ne: req.user.id
                    }
                });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already in use"
                });
            }

            user.email = normalizedEmail;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Update User Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to update profile"
        });
    }
};


// ==========================================
// DELETE ACCOUNT
// ==========================================

const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // ------------------------------------------
        // Find every chat belonging to this user
        // ------------------------------------------

        const chats = await Chat.find({
            user: userId
        }).select("_id");


        const chatIds = chats.map(
            (chat) => chat._id
        );


        // ------------------------------------------
        // Delete messages belonging to those chats
        // ------------------------------------------

        if (chatIds.length > 0) {
            await Message.deleteMany({
                chat: {
                    $in: chatIds
                }
            });
        }


        // ------------------------------------------
        // Delete chats
        // ------------------------------------------

        await Chat.deleteMany({
            user: userId
        });


        // ------------------------------------------
        // Finally delete user
        // ------------------------------------------

        await User.findByIdAndDelete(userId);


        return res.status(200).json({
            message:
                "Account and associated data deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete User Error:",
            error
        );

        return res.status(500).json({
            message: "Unable to delete account"
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateUser,
    deleteUser
};