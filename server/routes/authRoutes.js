const express = require('express');
const router = express.Router();
const {register, login, logout} = require('../controllers/auth'); // Ensure this matches your file structure
const { verifyToken } = require('../middleware/auth'); // Ensure this matches your file structure
const {refreshToken} = require('../controllers/auth');
// Register route
router.post('/register', register);
// Login route
router.post('/login', login);
// Logout route
router.post('/logout', verifyToken, logout);

// refresh token route
router.post('/refresh-token', refreshToken);


module.exports = router;