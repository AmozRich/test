const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Assuming faculty are stored here

router.get("/faculty-list", async (req, res) => {
    try {
        const facultyList = await User.find({ role: "faculty" }).select("name facultyNumber _id");
        res.json(facultyList);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
