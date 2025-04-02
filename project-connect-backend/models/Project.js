// models/Project.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solution: { type: String, required: true },
    department: { type: String, required: true },
    domain: { type: String, required: true },
    batch: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    methodology: { type: String, required: true },
    result: { type: String, required: true },
    githubRepo: { type: String },
    status: { 
        type: String, 
        required: true,
        enum: [
            "Pending Faculty Approval",
            "Pending HOD Approval",
            "Approved",
            "Rejected by Faculty",
            "Rejected by HOD"
        ],
        default: "Pending Faculty Approval"
    },
    rejectionReason: { type: String },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);