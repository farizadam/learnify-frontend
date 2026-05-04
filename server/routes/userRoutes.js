const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth'); 
const { getUserInfo } = require('../controllers/user'); 
const { get } = require('mongoose');

//route to get user info
router.get('/user',verifyToken,getUserInfo);


module.exports = router;