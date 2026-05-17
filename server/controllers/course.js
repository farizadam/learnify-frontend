const Course = require('../models/Course');
const User   = require('../models/User');
const Lesson = require('../models/Lesson');

// CREATE
const createCourse = async (req, res) => {
  try {
    const { title, description, level, category } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    const newCourse = new Course({
      title, description, level, category,
      instructor: req.user.id,
      lessons: [], studentsEnrolled: [], studentsPassed: [],
    });

    await newCourse.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { taughtCourses: newCourse._id } });

    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while creating the course' });
  }
};

//  GET ALL 
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'firstName lastName');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while fetching courses' });
  }
};

//  GET BY ID 
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('lessons');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json(course);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Course ID format' });
    res.status(500).json({ message: 'Something went wrong while fetching the course' });
  }
};

//  DELETE 
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this course' });
    }

    await Course.deleteOne({ _id: req.params.courseId });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Course ID format' });
    res.status(500).json({ message: 'Server error' });
  }
};

//  UPDATE 
const updateCourse = async (req, res) => {
  try {
    const { title, description, level, category } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'teacher' || course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own courses' });
    }

    course.title       = title       || course.title;
    course.description = description || course.description;
    course.level       = level       || course.level;
    course.category    = category    || course.category;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update Error:', error);
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Course ID format' });
    res.status(500).json({ message: 'Something went wrong while updating the course' });
  }
};

//  GET LESSONS OF COURSE 
const getAllLessonsofCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ course: courseId }).select('-fileData');
    res.status(200).json({ lessons });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Something went wrong while fetching lessons' });
  }
};

//  GET CATEGORIES 
const getAllCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category');
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while fetching categories' });
  }
};

module.exports = {
  createCourse, getAllCourses, getCourseById,
  deleteCourse, getAllLessonsofCourse, updateCourse, getAllCategories,
};