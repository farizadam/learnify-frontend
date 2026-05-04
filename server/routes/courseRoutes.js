const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createCourse, getAllCourses, getCourseById} = require('../controllers/course');
const { createLesson, deleteLesson, getLessonById, updateLesson } = require('../controllers/lesson');
router.post('/', verifyToken, createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

//router.delete('/courses/:id', verifyToken, deleteCourse);
router.post('/addLesson', verifyToken,createLesson)
router.patch('/updateLesson/:lessonId', verifyToken, updateLesson);

module.exports = router;
