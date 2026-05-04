const mongoose = require("mongoose");

const {Schema} = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'teacher', 'admin'], 
        default: 'student' 
    },
    // Tip: Use virtuals later to fetch these instead of hard-storing them
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    enrolledLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    taughtCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    isVerified: { type: Boolean, default: false },
    bio: { type: String, maxlength: 250 },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);