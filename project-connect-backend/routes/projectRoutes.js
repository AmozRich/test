//projectRoutes.js
const express = require("express");
const Project = require("../models/Project");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware"); // Ensure you have this middleware
const router = express.Router();
const jwt = require("jsonwebtoken");
// const cors = require("cors");
// router.use(cors());

// 🟢 Add New Project (Student Submission)

router.post("/add", authenticateToken, async (req, res) => {
    console.log("🟢 [DEBUG] Received POST request to /add-project");
    console.log("🟢 [DEBUG] Request Body:", req.body);
    try {
        const studentId = req.user.id; // Get student ID from token
        console.log(studentId)

        // Validate required fields
        const { title, category, problemStatement, solution, department, domain, methodology, result } = req.body;
        if (!title || !category || !problemStatement || !solution || !department || !domain || !methodology || !result) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newProject = new Project({
            title,
            category,
            problemStatement,
            solution,
            department,
            domain,
            methodology,
            result,
            status: "Pending Faculty Approval",
            studentId
        });

        await newProject.save();
        res.status(201).json({ message: "Project added successfully!" });
    } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).json({ message: "Error adding project" });
    }
});


router.get("/test", (req, res) => {
    res.json({ message: "API is working!" });
});

router.post("/test", (req, res) => {
    console.log("✅ [SERVER] Received POST request at /test");
    console.log("🟢 [DEBUG] Request Body:", req.body);

    res.status(200).json({ message: "Test route working!", receivedData: req.body });
});

router.get("/student", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode JWT
        const studentId = decoded.id;  // Ensure the correct field name

        console.log("Authenticated Student ID:", studentId);

        const projects = await Project.find({ studentId });
        res.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// 🟢 Get Projects Assigned to Faculty
router.get("/faculty", authenticateToken, checkRole("faculty"), async (req, res) => {
    try {
        const projects = await Project.find({ status: { $in: ["Pending Faculty Approval", "Pending HOD Approval", "Rejected by Faculty"] } });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching faculty projects" });
    }
});

// 🟢 Update Project Status (Approve/Reject)
router.put("/status/:projectId", authenticateToken, checkRole("faculty"), async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const updatedProject = await Project.findByIdAndUpdate(req.params.projectId, { status, rejectionReason }, { new: true });
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: "Error updating project status" });
    }
});
// 🟢 Get All Approved Projects (For Browsing)
router.get("/approved", async (req, res) => {
    try {
        const projects = await Project.find({ status: "Approved" });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects" });
    }
});

// 🟢 Correct API Endpoint for Adding Projects
router.post("/add-project", authenticateToken, async (req, res) => { 
    console.log("🟢 [DEBUG] Received POST request to /add-project");
    console.log("🟢 [DEBUG] Request Body:", req.body);
    try {
        console.log("🔵 [INFO] Received POST request to /add-project");

        // Check if user exists from token
        console.log("🟢 [DEBUG] User Object from Token:", req.user);
        if (!req.user || !req.user.id) {
            console.log("🔴 [ERROR] Unauthorized: Invalid token");
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const studentId = req.user.id; // Extract student ID from token

        // Log received request body
        console.log("🟢 [DEBUG] Request Body:", req.body);

        // Validate required fields
        const { title, category, problemStatement, solution, department, domain, shortDescription, longDescription, githubRepo } = req.body;
        if (!title || !category || !problemStatement || !solution || !department || !domain || !shortDescription || !longDescription) {
            console.log("🔴 [ERROR] Missing required fields");
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new project object
        const newProject = new Project({
            title,
            category,
            problemStatement,
            solution,
            department,
            domain,
            shortDescription,
            longDescription,
            githubRepo,
            status: "Pending Faculty Approval",
            studentId
        });

        // Save to DB
        await newProject.save();
        console.log("✅ [SUCCESS] Project added successfully!");

        res.status(201).json({ message: "Project added successfully!" });

    } catch (error) {
        console.error("🔴 [ERROR] Error adding project:", error.message || error);
        res.status(500).json({ message: "Internal Server Error", error: error.message || error });
    }
});




// Export the router
module.exports = router;
