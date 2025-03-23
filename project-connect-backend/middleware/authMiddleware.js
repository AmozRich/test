const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    // console.log(token);

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) 
            return 
        res.status(403).json({ message: "Invalid Token" });
        console.log(token,"from authenticateToken");
        req.user = user;
        next();
    });
}

// Middleware to check if the user has the required role
function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
}

module.exports = { authenticateToken, checkRole };
