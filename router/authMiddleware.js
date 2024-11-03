const jwt = require('jsonwebtoken');
const User = require('../model/userSchema');
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken; // Get token from cookies
        console.log("JWT Token received:", token); // Log the token for debugging

        if (!token) {
            return res.status(401).json({ error: "Authentication failed. Please login." });
        }

        const verifiedToken = jwt.verify(token, process.env.SECRET_KEY); // Verify token

        // Find the user by ID in the token payload
        const user = await User.findById(verifiedToken._id);

        if (!user) {
            console.error("User not found during authentication.");
            return res.status(404).json({ error: "Kindly register and then logged in yourself,If you have been already registered then kindly logged in yourself  so that we can recover your data stored in an application." });
        }

        req.user = user; // Attach the user object to the request
        next(); // Move to the next middleware or route
    } catch (err) {
        console.error("Authentication error:", err); // Log any errors
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

module.exports = authenticate;