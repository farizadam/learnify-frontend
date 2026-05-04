const mongoose = require('mongoose');
const { Schema } = mongoose;



const LessonSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String }, // Can store HTML or a Video URL
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    // Only track progress here
    studentsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });



module.exports = mongoose.model('Lesson', LessonSchema);