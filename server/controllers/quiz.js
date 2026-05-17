const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizeQuestions = (questions = []) =>
	questions.map(({ question, options }) => ({
		question,
		options: Array.isArray(options) ? options : [],
	}));

const calculateQuizResult = (questions, answers, passingScore = 80) => {
	const total = questions.length;
	let correctCount = 0;
	const wrongAnswers = [];

	questions.forEach((question, index) => {
		const submittedAnswer = answers[index];
		const options = Array.isArray(question.options) ? question.options : [];
		const hasValidSubmittedAnswer =
			Number.isInteger(submittedAnswer) &&
			submittedAnswer >= 0 &&
			submittedAnswer < options.length;
		const hasValidCorrectAnswer =
			Number.isInteger(question.correctAnswer) &&
			question.correctAnswer >= 0 &&
			question.correctAnswer < options.length;
		const selectedAnswer = hasValidSubmittedAnswer ? String(options[submittedAnswer]) : null;
		const correctAnswer = hasValidCorrectAnswer ? String(options[question.correctAnswer]) : '';

		if (hasValidSubmittedAnswer && submittedAnswer === question.correctAnswer) {
			correctCount += 1;
			return;
		}

		wrongAnswers.push({
			questionId: question._id ? question._id.toString() : null,
			questionText: question.question,
			selectedAnswer,
			correctAnswer,
			courseSection: question.courseSection ?? null,
		});
	});

	const percentage = total === 0 ? 0 : Number(((correctCount / total) * 100).toFixed(2));

	return {
		score: correctCount,
		total,
		percentage,
		passed: percentage >= passingScore,
		wrongAnswers,
	};
};

const validateSubmitPayload = (payload) => {
	const normalizedPayload = payload && typeof payload === 'object' ? payload : {};
	const courseId =
		typeof normalizedPayload.courseId === 'string'
			? normalizedPayload.courseId.trim()
			: normalizedPayload.courseId;
	const { answers } = normalizedPayload;

	if (!courseId || !isValidObjectId(courseId)) {
		return {
			valid: false,
			statusCode: 400,
			message: 'A valid courseId is required.',
		};
	}

	if (!Array.isArray(answers)) {
		return {
			valid: false,
			statusCode: 400,
			message: 'answers must be an array of option indexes.',
		};
	}

	if (answers.some((answer) => !Number.isInteger(answer))) {
		return {
			valid: false,
			statusCode: 400,
			message: 'Each answer must be an integer option index.',
		};
	}

	return {
		valid: true,
		courseId,
		answers,
	};
};

const buildAttemptContext = ({ req, quiz, answers, result }) => ({
	userId: req.user?._id || req.user?.id || null,
	courseId: quiz.courseId.toString(),
	quizId: quiz._id.toString(),
	answers,
	...result,
	attemptedAt: new Date(),
});

const getQuizByCourse = async (req, res, next) => {
	try {
		const { courseId } = req.params;

		if (!courseId || !isValidObjectId(courseId)) {
			return res.status(400).json({ message: 'Invalid courseId format.' });
		}

		const quiz = await Quiz.findOne({ courseId }).select('courseId title questions').lean();

		if (!quiz) {
			return res.status(404).json({ message: 'Quiz not found for the provided courseId.' });
		}

		return res.status(200).json({
			courseId: quiz.courseId.toString(),
			title: quiz.title,
			questions: sanitizeQuestions(quiz.questions),
		});
	} catch (error) {
		if (typeof next === 'function') {
			return next(error);
		}

		return res.status(500).json({ message: 'Internal server error.' });
	}
};

const submitQuiz = async (req, res, next) => {
	try {
		const payloadValidation = validateSubmitPayload(req.body);

		if (!payloadValidation.valid) {
			return res
				.status(payloadValidation.statusCode)
				.json({ message: payloadValidation.message });
		}

		const { courseId, answers } = payloadValidation;

		const quiz = await Quiz.findOne({ courseId })
			.select('_id courseId passingScore questions')
			.lean();

		if (!quiz) {
			return res.status(404).json({ message: 'Quiz not found for the provided courseId.' });
		}

		const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

		if (answers.length !== questions.length) {
			return res
				.status(400)
				.json({ message: `answers length must match total questions (${questions.length}).` });
		}

		const result = calculateQuizResult(questions, answers, quiz.passingScore ?? 80);

		// Si passed, ajouter l'user dans studentsPassed du course
		if (result.passed) {
			const userId = req.user?._id || req.user?.id;
			await Course.findByIdAndUpdate(courseId, {
				$addToSet: { studentsPassed: userId },
			});
		}

		res.locals.quizAttempt = buildAttemptContext({
			req,
			quiz,
			answers,
			result,
		});

		return res.status(200).json({ ...result, courseId });
	} catch (error) {
		if (typeof next === 'function') {
			return next(error);
		}

		return res.status(500).json({ message: 'Internal server error.' });
	}
};

const createQuiz = async (req, res) => {
	try {
		if (req.user.role !== 'teacher') {
			return res.status(403).json({ message: 'Only teachers can create quizzes.' });
		}

		const { courseId, title, questions, passingScore } = req.body;

		if (!courseId || !isValidObjectId(courseId)) {
			return res.status(400).json({ message: 'A valid courseId is required.' });
		}
		if (!title || !title.trim()) {
			return res.status(400).json({ message: 'Quiz title is required.' });
		}
		if (!Array.isArray(questions) || questions.length === 0) {
			return res.status(400).json({ message: 'At least one question is required.' });
		}

		// Vérifier que le teacher possède ce cours
		const course = await Course.findById(courseId);
		if (!course) return res.status(404).json({ message: 'Course not found.' });
		if (course.instructor.toString() !== req.user.id) {
			return res.status(403).json({ message: 'You can only create quizzes for your own courses.' });
		}

		// Supprimer ancien quiz si existe
		await Quiz.deleteOne({ courseId });

		const quiz = new Quiz({
			courseId,
			title: title.trim(),
			questions,
			passingScore: passingScore ?? 80,
		});

		await quiz.save();
		return res.status(201).json({ message: 'Quiz created successfully.', quiz });
	} catch (error) {
		return res.status(500).json({ message: error.message || 'Internal server error.' });
	}
};


module.exports = {
	getQuizByCourse,
	submitQuiz,
	createQuiz,
};