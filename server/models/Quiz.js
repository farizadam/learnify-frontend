const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: [true, 'Question text is required.'],
			trim: true,
			minlength: [1, 'Question text cannot be empty.'],
		},
		options: {
			type: [String],
			required: [true, 'Options are required.'],
			validate: [
				{
					validator: (options) => Array.isArray(options) && options.length >= 2,
					message: 'Each question must have at least two options.',
				},
				{
					validator: (options) =>
						Array.isArray(options) &&
						options.every((option) => typeof option === 'string' && option.trim().length > 0),
					message: 'Each option must be a non-empty string.',
				},
			],
			set: (options) =>
				Array.isArray(options) ? options.map((option) => option.trim()) : options,
		},
		correctAnswer: {
			type: Number,
			required: [true, 'Correct answer index is required.'],
			min: [0, 'Correct answer index cannot be negative.'],
			validate: {
				validator(correctAnswer) {
					return (
						Number.isInteger(correctAnswer) &&
						Array.isArray(this.options) &&
						correctAnswer < this.options.length
					);
				},
				message: 'Correct answer must be a valid option index.',
			},
		},
		courseSection: {
			type: String,
			trim: true,
			default: null,
		},
	},
	{}
);

const quizSchema = new mongoose.Schema(
	{
		courseId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
			required: [true, 'courseId is required.'],
			index: true,
		},
		title: {
			type: String,
			required: [true, 'Quiz title is required.'],
			trim: true,
			minlength: [1, 'Quiz title cannot be empty.'],
		},
		questions: {
			type: [quizQuestionSchema],
			required: [true, 'Quiz must contain questions.'],
			validate: {
				validator: (questions) => Array.isArray(questions) && questions.length > 0,
				message: 'Quiz must include at least one question.',
			},
		},
		passingScore: {
			type: Number,
			default: 80,
			min: [0, 'Passing score cannot be below 0.'],
			max: [100, 'Passing score cannot be above 100.'],
		},
	},
	{
		timestamps: true,
	}
);

quizSchema.index({ courseId: 1 });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
