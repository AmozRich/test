// projectRoutes.js
const express = require("express");
const Project = require("../models/Project");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/test", (req, res) => {
    res.json({ message: "API is working!" });
});

// Add New Project (Student Submission)
router.post("/add-project", authenticateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const studentId = req.user.id;
        const {
            title,
            category,
            problemStatement,
            solution,
            department,
            domain,
            batch,
            shortDescription,
            longDescription,
            githubRepo,
            methodology,
            result
        } = req.body;

        if (!title || !category || !problemStatement || !solution || !department || !domain || 
            !shortDescription || !longDescription || !methodology || !result) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const newProject = new Project({
            title,
            category,
            problemStatement,
            solution,
            department,
            domain,
            batch,
            shortDescription,
            longDescription,
            githubRepo: githubRepo || null,
            methodology,
            result,
            status: "Pending Faculty Approval",
            studentId
        });

        await newProject.save();
        res.status(201).json({ message: "Project added successfully!" });
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get Student's Projects
router.get("/student", authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        const projects = await Project.find({ studentId })
        .populate("guideId", "name facultyNumber");
        res.json(projects);
    } catch (error) {
        console.error("Error fetching student projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get Projects for Faculty Review
router.get("/faculty", authenticateToken, checkRole("faculty"), async (req, res) => {
    try {
        const projects = await Project.find({ 
            status: { $in: ["Pending Faculty Approval", "Pending HOD Approval", "Rejected by Faculty"] }
        });
        res.json(projects);
    } catch (error) {
        console.error("Error fetching faculty projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get Projects for HOD Review
router.get("/hod", authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== "hod") {
            return res.status(403).json({ message: "Access denied" });
        }

        const projects = await Project.find({
            status: { $in: ["Pending HOD Approval", "Approved", "Rejected by HOD"] }
        });

        res.json(projects);
    } catch (error) {
        console.error("Error fetching HOD projects:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update Project Status (Faculty/HOD)
router.put("/status/:projectId", authenticateToken, checkRole(["faculty", "hod"]), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const validStatuses = [
            "Pending Faculty Approval",
            "Pending HOD Approval",
            "Approved",
            "Rejected by Faculty",
            "Rejected by HOD"
        ];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateData = { status };
        if (rejectionReason) updateData.rejectionReason = rejectionReason;

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.projectId,
            updateData,
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(updatedProject);
    } catch (error) {
        console.error("Error updating project status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get All Approved Projects
router.get("/approved", async (req, res) => {
    try {
        const projects = await Project.find({ status: "Approved" });
        res.json(projects);
    } catch (error) {
        console.error("Error fetching approved projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ✅ IMPORTANT: Keep this route at the END
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id)
        .populate("guideId", "name facultyNumber") // ✅ fetch guide info
        .populate("studentId", "name admissionNumber"); // optional: fetch student info too
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
