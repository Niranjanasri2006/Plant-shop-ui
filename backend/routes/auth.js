const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


/* Builds a signed JWT for a given user id.
   The frontend stores this token in localStorage and treats
   its presence as "logged in". */

function generateToken(userId) {

    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

}


/* Shapes the Mongo user document into the safe object we send
   back to the frontend (never send the hashed password). */

function toSafeUser(user) {

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        address: user.address
    };

}


// ================= REGISTER =================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, dob, address } = req.body;

        // Check all fields
        if (!name || !email || !password || !phone || !dob || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            dob,
            address
        });

        await newUser.save();

        const token = generateToken(newUser._id);

        res.status(201).json({
            message: "User registered successfully",
            token: token,
            user: toSafeUser(newUser)
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= LOGIN =================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        // Login successful
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: toSafeUser(user)
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


// ================= FORGOT PASSWORD (simple version) =================
// Verifies the user by matching email + phone number (both already
// stored from signup), then lets them set a brand new password.
// No email server needed.

router.post("/forgot-password", async (req, res) => {
    try {
        const { email, phone, newPassword } = req.body;

        if (!email || !phone || !newPassword) {
            return res.status(400).json({
                message: "Email, phone number and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters"
            });
        }

        // Match both email and phone together so we don't leak
        // which one was wrong
        const user = await User.findOne({ email, phone });

        if (!user) {
            return res.status(400).json({
                message: "Email and phone number do not match our records"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});


module.exports = router;