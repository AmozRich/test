const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    admissionNumber: { type: String, unique: true, sparse: true }, // For students
    facultyNumber: { type: String, unique: true, sparse: true },   // For faculty
    password: { type: String, required: true },  // Hashed password
    role: { type: String, enum: ["student", "faculty", "hod"], required: true } // Role-based access
});

module.exports = mongoose.model("User", UserSchema);
