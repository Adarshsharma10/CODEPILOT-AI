const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    getProfile,
    updateUser,
    deleteUser
} = require("../controllers/userController");


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register
router.post(
    "/register",
    registerUser
);


// Login
router.post(
    "/login",
    loginUser
);


// ==========================================
// PROTECTED ROUTES
// ==========================================

// Get logged-in user's profile
router.get(
    "/profile",
    authMiddleware,
    getProfile
);


// Update logged-in user's profile
router.put(
    "/profile",
    authMiddleware,
    updateUser
);


// Delete logged-in user's account
router.delete(
    "/profile",
    authMiddleware,
    deleteUser
);


module.exports = router;