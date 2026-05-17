const Lesson = require('../models/Lesson');
const Course  = require('../models/Course');

function getFileType(mimetype) {
  if (!mimetype) return null;
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('video/'))  return 'video';
  return null;
}

//  CREATE LESSON 
const createLesson = async (req, res) => {
  try {
    const { title, content, courseId } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create lessons' });
    }
    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and courseId are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.id.toString() !== course.instructor.toString()) {
      return res.status(403).json({ message: 'You can only add lessons to your own courses' });
    }

    let fileData = null;
    let fileType = null;
    let fileName = null;
    let fileMime = null;

    if (req.file) {
      // Convertir le buffer en base64
      fileData = req.file.buffer.toString('base64');
      fileType = getFileType(req.file.mimetype);
      fileName = req.file.originalname;
      fileMime = req.file.mimetype;
    }

    const newLesson = new Lesson({
      title, content, course: courseId,
      fileData, fileType, fileName, fileMime,
    });

    await newLesson.save();
    await Course.findByIdAndUpdate(courseId, { $push: { lessons: newLesson._id } });

    // Retourner sans fileData (trop lourd) pour la réponse
    const lessonResponse = newLesson.toObject();
    delete lessonResponse.fileData;
    lessonResponse.hasFile = !!fileData;

    res.status(201).json({ message: 'Lesson created successfully', lesson: lessonResponse });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

//  DELETE LESSON 
const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'teacher' || req.user.id.toString() !== course.instructor.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Lesson.findByIdAndDelete(lessonId);
    await Course.findByIdAndUpdate(course._id, { $pull: { lessons: lessonId } });

    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

//  GET LESSON FILE (pour afficher le PDF/vidéo) 
const getLessonFile = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId).select('fileData fileMime fileName fileType');

    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (!lesson.fileData) return res.status(404).json({ message: 'No file attached to this lesson' });

    // Convertir base64 -> buffer et envoyer comme fichier
    const buffer = Buffer.from(lesson.fileData, 'base64');
    res.set('Content-Type', lesson.fileMime || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${lesson.fileName || 'file'}"`);
    res.set('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET LESSON BY ID 
const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId)
      .select('-fileData')
      .populate('course', 'title');

    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    res.status(200).json({ lesson });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE LESSON 
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (req.user.role !== 'teacher' || req.user.id.toString() !== course.instructor.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.file) {
      lesson.fileData = req.file.buffer.toString('base64');
      lesson.fileType = getFileType(req.file.mimetype);
      lesson.fileName = req.file.originalname;
      lesson.fileMime = req.file.mimetype;
    }

    if (title) lesson.title = title;
    if (content !== undefined) lesson.content = content;

    await lesson.save();

    const lessonResponse = lesson.toObject();
    delete lessonResponse.fileData;
    lessonResponse.hasFile = !!(lesson.fileData);

    res.status(200).json({ message: 'Lesson updated successfully', lesson: lessonResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  COMPLETE LESSON 
const completeLesson = async (req, res) => {
  try {
    const { lessonId, id } = req.params;
    const lessonIdentifier = lessonId || id;
    const lesson = await Lesson.findById(lessonIdentifier);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    if (!lesson.studentsCompleted.includes(req.user.id)) {
      lesson.studentsCompleted.push(req.user.id);
      await lesson.save();
    }
    res.status(200).json({ message: 'Lesson marked as complete' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLesson, deleteLesson, getLessonById, getLessonFile, updateLesson, completeLesson };