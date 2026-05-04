const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Ensure this matches your file structure
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE ---

const verifyToken = (req, res, next) => {
    let token;

    // Check header for Bearer token
    if (req.headers['authorization'] && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded payload to the request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Exporting as an object so they can be imported individually
module.exports = {verifyToken };