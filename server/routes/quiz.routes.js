const express = require('express');
const { getQuizByCourse, submitQuiz } = require('../controllers/quiz');
const protect = require('../middleware/auth');

const router = express.Router();

router.get('/:courseId', protect, getQuizByCourse);
router.post('/submit', protect, submitQuiz);

module.exports = router;
