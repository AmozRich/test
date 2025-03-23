require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const projectRoutes = require("./routes/projectRoutes");


const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// User Schema & Model
const UserSchema = new mongoose.Schema({
    admissionNumber: { type: String, unique: true, sparse: true }, // For students
    facultyNumber: { type: String, unique: true, sparse: true },   // For faculty
    password: String,
    role: String // "student" or "faculty"
});
const User = mongoose.model("User", UserSchema);

// 🟢 Register New Users (For Testing Purposes)
app.post("/api/register", async (req, res) => {
    const { admissionNumber, facultyNumber, password, role } = req.body;

    // Check if user exists
    let existingUser;
    if (admissionNumber) {
        existingUser = await User.findOne({ admissionNumber });
    } else if (facultyNumber) {
        existingUser = await User.findOne({ facultyNumber });
    }

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        admissionNumber,
        facultyNumber,
        password: hashedPassword,
        role
    });

    await newUser.save();
    res.json({ message: "User registered successfully!" });
});

// 🟢 Login Route (For Students & Faculty)
app.post("/api/login", async (req, res) => {
    const { admissionNumber, facultyNumber, password } = req.body;

    let user;
    if (admissionNumber) {
        user = await User.findOne({ admissionNumber });
    } else if (facultyNumber) {
        user = await User.findOne({ facultyNumber });
    }

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
});


// 🟢 Protected Route (Example)
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "You accessed a protected route!", user: req.user });
});

// Middleware: Verify JWT Token
function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
}

// Start Server
app.use("/api/projects", projectRoutes);
app.listen(5000, () => console.log("🚀 Server running on port 5000"));