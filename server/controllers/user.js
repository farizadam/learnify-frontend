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
        const { firstName, lastName, email } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName  !== undefined) user.lastName  = lastName;
        if (email     !== undefined) user.email      = email;

        await user.save();
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
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
      
        if (user.enrolledCourses.includes(courseId) || 
            course.studentsEnrolled.some(s => s.toString() === user._id.toString())) {
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


const getAllCoursesOfInstructor = async (req, res) => {
    try {
        const instructorId = req.user.id;

        if (!instructorId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const courses = await Course.find({ instructor: instructorId }).populate('instructor', 'firstName lastName');
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllCoursesEnrolled = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ enrolledCourses: user.enrolledCourses });
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong while fetching enrolled courses" });
    }
};
const updateUserProfile = async (req, res) => {
    try {
        const { bio, avatar, socialLinks, firstName, lastName } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;

        await user.save();
        
        // Return without password
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong updating profile" });
    }
};

const getPublicProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('firstName lastName bio avatar socialLinks role');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const response = { user };

        if (user.role === 'teacher') {
            const courses = await Course.find({ instructor: userId }).select('title description level category');
            response.courses = courses;
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong fetching public profile" });
    }
};

module.exports = { getUserInfo, updateUserInfo, deleteUser, enrollCourse, enrollLesson, getAllCoursesOfInstructor, getAllCoursesEnrolled, updateUserProfile, getPublicProfile };