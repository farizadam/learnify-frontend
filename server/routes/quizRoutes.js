const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getQuizByCourse, submitQuiz, createQuiz } = require('../controllers/quiz');

router.post('/', verifyToken, createQuiz);
router.get('/course/:courseId', verifyToken, getQuizByCourse);
//router.post('/:id/submit', verifyToken, submitQuiz);
router.post('/:courseId/submit', verifyToken, submitQuiz);

module.exports = router;