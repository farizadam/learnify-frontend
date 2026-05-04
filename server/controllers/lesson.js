const Lesson = require('../models/Lesson');
const Course = require('../models/Course');


const createLesson = async (req, res) => {
    try {
        const { title, content, courseId } = req.body;
 
        if(req.user.role !== 'teacher') {
            return res.status(403).json({ message: "Only teachers can create lessons" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (req.user.id.toString() !== course.instructor.toString()) {
            return res.status(403).json({ message: "You can only add lessons to your own courses" });
        }
        const newLesson = new Lesson({
            title,
            content,
            course: courseId,
        });
        await newLesson.save();
        await Course.findByIdAndUpdate(courseId, {
            $push: { lessons: newLesson._id }
        });
        res.status(201).json({ message: "Lesson created successfully", lesson: newLesson });
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong while creating the lesson" });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const lesson = await Lesson.findById(lessonId);
        
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const course = await Course.findById(lesson.course);

        if(req.user.role !== 'teacher' || req.user.id.toString() !== course.instructor.toString()) {
            return res.status(403).json({ message: "You can only delete lessons from your own courses" });
        }

        await Lesson.findByIdAndDelete(lessonId);
        await Course.findByIdAndUpdate(course._id, {
            $pull: { lessons: lessonId }
        });
        res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong while deleting the lesson" });
    }
};   

const getLessonById = async (req, res) => {
    try {
            const {LessonId} = req.params;
            const lesson = await Lesson.findById(LessonId).populate('course', 'title');

            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found" });
            }
            res.status(200).json({ lesson });
    } catch (error) {
        res.status(500).json({ message: error.message || "Something went wrong while fetching the lesson" });
    }
};

const updateLesson = async (req, res) => {
    try {   
        const { lessonId } = req.params;
        const { title, content } = req.body;

        // 1. Find the lesson first
        const lesson = await Lesson.findById(lessonId);
        if(!lesson) {   
            return res.status(404).json({ message: "Lesson not found" });
        }

        // 2. Fetch the course (Using the course ID stored in the lesson)
        // You MUST do this before checking the instructor
        const course = await Course.findById(lesson.course); 
        
        if (!course) {
            return res.status(404).json({ message: "Associated course not found" });
        }

        // 3. Ownership Check (Teacher role + Instructor match)
        if(req.user.role !== 'teacher' || req.user.id.toString() !== course.instructor.toString()) {
            return res.status(403).json({ message: "You can only update lessons from your own courses" });
        }

        // 4. Update the fields
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        
        await lesson.save();

        res.status(200).json({ message: "Lesson updated successfully", lesson });
    } catch (error) {
        // Log it to see exactly which line is failing in your console
        console.error("Update Error:", error); 
        res.status(500).json({ message: error.message });
    }
};




module.exports = { createLesson, deleteLesson, getLessonById, updateLesson };