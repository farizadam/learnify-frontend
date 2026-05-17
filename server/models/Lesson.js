const mongoose = require('mongoose');
const { Schema } = mongoose;

const LessonSchema = new Schema({
  title:    { type: String, required: true },
  content:  { type: String },
  course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Fichier stocké en base64 dans MongoDB
  fileData:  { type: String, default: null },   // base64 string
  fileType:  { type: String, enum: ['pdf', 'video', null], default: null },
  fileName:  { type: String, default: null },   // nom original du fichier
  fileMime:  { type: String, default: null },   // ex: application/pdf
  fileUrl:   { type: String, default: null },
  publicId:  { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', LessonSchema);