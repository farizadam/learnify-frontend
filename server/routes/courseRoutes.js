const express = require('express');
const router  = express.Router();

const { verifyToken } = require('../middleware/auth');
const { upload }      = require('../middleware/upload');
const {
  createCourse, getAllCourses, getCourseById,
  deleteCourse, getAllLessonsofCourse, updateCourse, getAllCategories,
} = require('../controllers/course');
const {
  createLesson, deleteLesson, getLessonById, getLessonFile, updateLesson, completeLesson,
} = require('../controllers/lesson');
const { enrollCourse, getAllCoursesOfInstructor } = require('../controllers/user');

// Courses
router.get('/categories',                getAllCategories);
router.get('/teacher/me', verifyToken,   getAllCoursesOfInstructor);

//  Lessons 
router.post('/addLesson',                verifyToken, upload.single('file'), createLesson);
router.patch('/updateLesson/:lessonId',  verifyToken, upload.single('file'), updateLesson);
router.delete('/deleteLesson/:lessonId', verifyToken, deleteLesson);
router.get('/lesson/:lessonId/file',     verifyToken, getLessonFile);
router.post('/lesson/:lessonId/complete', verifyToken, completeLesson);
router.get('/lesson/:lessonId',          getLessonById);

//  Courses (routes dynamiques après) 
router.get('/',                          getAllCourses);
router.get('/:id',                       getCourseById);

router.post('/createCourse',             verifyToken, createCourse);
router.patch('/updateCourse/:courseId',  verifyToken, updateCourse);
router.delete('/deleteCourse/:courseId', verifyToken, deleteCourse);

router.get('/:courseId/lessons',         getAllLessonsofCourse);

//  Enroll 
router.post('/:courseId/enroll', verifyToken, enrollCourse);

module.exports = router;