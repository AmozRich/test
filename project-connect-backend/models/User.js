// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    admissionNumber: { type: String, unique: true, sparse: true }, // For students
    facultyNumber: { type: String, unique: true, sparse: true },   // For faculty
    name: { type: String },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["student", "faculty", "hod"] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);