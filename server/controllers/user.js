const User = require('../models/User');
const Course = require('../models/Course');
// Get user info

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        // Exclude password
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user info

const updateUserInfo = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(req.user.id !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if(req.user.id !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await user.remove();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const enrollCourse = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const courseId = req.params.courseId;
        const course = await Course.findById(req.params.courseId);
        

        if (!user || !course) {
            return res.status(404).json({ message: 'User or course not found' });
        }
      
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        if(user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can enroll in courses' });
        }

        user.enrolledCourses.push(courseId);
        await user.save();
        course.studentsEnrolled.push(user._id);
        await course.save();

        res.json({ message: 'Enrolled in course successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }};


const enrollLesson = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const courseId = req.params.courseId;
        const lessonId = req.params.lessonId;
        const course = await Course.findById(courseId);
        const lesson = course.lessons.id(lessonId);
        if (!user || !course || !lesson) {
            return res.status(404).json({ message: 'User, course, or lesson not found' });
        }

        if(user.role !== 'student' || !course.studentsEnrolled.includes(user._id) || !lesson.studentsEnrolled.includes(user._id)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        lesson.enrolledStudents.push(user._id);
        await lesson.save();
        user.enrolledLessons.push(lessonId);
        await user.save();

        res.json({ message: 'Enrolled in lesson successfully' });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserInfo, updateUserInfo, deleteUser, enrollCourse,enrollLesson };