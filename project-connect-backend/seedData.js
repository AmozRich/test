require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Project = require("./models/Project");

console.log("✅ Loading environment variables...");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded Successfully" : "MISSING!");

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ✅ Predefined Users (Students & Faculty)
const predefinedUsers = [
    { admissionNumber: "5746", password: "5746", role: "student" },
    { admissionNumber: "5747", password: "5747", role: "student" },
    { admissionNumber: "5748", password: "5748", role: "student" },
    { facultyNumber: "FAC001", password: "fac001", role: "faculty" },
    { facultyNumber: "FAC002", password: "fac002", role: "faculty" },
    { facultyNumber: "HOD001", password: "hod001", role: "hod" }
];

// ✅ Predefined Projects
const predefinedProjects = [
    {
        title: "Smart Traffic System",
        category: "mini-project",
        problemStatement: "Optimize traffic flow using AI.",
        solution: "A smart AI-based traffic control system.",
        department: "CSE",
        domain: "AI",
        shortDescription: "An AI-powered smart traffic management system.",
        longDescription: "Using AI and IoT sensors, this system predicts and manages traffic dynamically.",
        methodology: "Machine learning-based traffic pattern recognition.",
        result: "Reduced traffic congestion in simulations.",
        status: "Pending Faculty Approval",
        studentAdmissionNumber: "5746"
    },
    {
        title: "Smart Traffic System",
        category: "mini-project",
        problemStatement: "Optimize traffic flow using AI.",
        solution: "A smart AI-based traffic control system.",
        department: "CSE",
        domain: "AI",
        shortDescription: "An AI-powered smart traffic management system.",
        longDescription: "Using AI and IoT sensors, this system predicts and manages traffic dynamically.",
        methodology: "Machine learning-based traffic pattern recognition.",
        result: "Reduced traffic congestion in simulations.",
        status: "Approved",
        studentAdmissionNumber: "5746",
    },
    {
        title: "IoT-Based Smart Farming",
        category: "main-project",
        problemStatement: "Automate farming using IoT devices.",
        solution: "A smart irrigation and crop monitoring system.",
        department: "ECE",
        domain: "IoT",
        shortDescription: "An IoT-based system to optimize farming efficiency.",
        longDescription: "This project uses IoT sensors to monitor soil moisture and automate irrigation.",
        methodology: "IoT sensors + cloud computing.",
        result: "Improved water efficiency in farming.",
        status: "Pending HOD Approval",
        studentAdmissionNumber: "5747"
    }
];

// ✅ Function to Seed Database
async function seedDatabase() {
    try {
        console.log("🔹 Clearing old data...");
        await User.deleteMany({});
        await Project.deleteMany({});
        console.log("✅ Old data cleared.");

        // 🔹 Hash passwords & insert users
        for (const user of predefinedUsers) {
            console.log(`🔹 Creating user: ${user.admissionNumber || user.facultyNumber}`);
            user.password = await bcrypt.hash(user.password, 10);
            const newUser = await User.create(user);
            console.log(`✅ User added: ${newUser.admissionNumber || newUser.facultyNumber}`);

            // If student has a project, assign it
            predefinedProjects.forEach(async (proj) => {
                if (proj.studentAdmissionNumber === user.admissionNumber) {
                    proj.studentId = newUser._id;
                    await Project.create(proj);
                    console.log(`✅ Project added for ${user.admissionNumber}: ${proj.title}`);
                }
            });
        }

        console.log("🎉 Database seeded successfully!");
    } catch (error) {
        console.error("❌ Seeding Error:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔹 MongoDB connection closed.");
    }
}

// ✅ Run the function
seedDatabase();
