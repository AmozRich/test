const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    department: { type: String, required: true },
    domain: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    methodology: { type: String },
    result: { type: String },
    status: { type: String, enum: ["Pending Faculty Approval", "Pending HOD Approval", "Approved", "Rejected by Faculty", "Rejected by HOD"], default: "Pending Faculty Approval" },
    rejectionReason: { type: String, default: "" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the student
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);
