// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const projectRoutes = require("./routes/projectRoutes");
const { authenticateToken } = require("./middleware/authMiddleware");
const User = require("./models/User");
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true
  }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Register Route
app.post("/api/register", async (req, res) => {
    const { admissionNumber, facultyNumber, password, role } = req.body;

    try {
        let existingUser;
        if (admissionNumber) {
            existingUser = await User.findOne({ admissionNumber });
        } else if (facultyNumber) {
            existingUser = await User.findOne({ facultyNumber });
        }

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            admissionNumber,
            facultyNumber,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Login Route
app.post("/api/login", async (req, res) => {
    const { admissionNumber, facultyNumber, password } = req.body;

    try {
        let user;
        if (admissionNumber) {
            user = await User.findOne({ admissionNumber });
        } else if (facultyNumber) {
            user = await User.findOne({ facultyNumber });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.json({ token, role: user.role });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Protected Route Example
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
});

// Project Routes
app.use("/api/projects", projectRoutes);

// Faculty List Route
app.get("/api/faculty/list", async (req, res) => {
    try {
        const facultyList = await User.find({ role: "faculty" }).select("_id facultyNumber name");
        res.json(facultyList);
    } catch (error) {
        console.error("Error fetching faculty list:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));