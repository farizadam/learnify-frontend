import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, Home, RotateCcw, Loader2, AlertCircle, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function QuizPage() {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/quizzes/course/${courseId}`);
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(undefined));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const handleAnswer = (idx) => {
    if (answers[currentQuestion] !== undefined) return;
    const next = [...answers];
    next[currentQuestion] = idx;
    setAnswers(next);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiFetch(`/quizzes/${courseId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ courseId, answers }),
      });
      setResult(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(undefined));
    setResult(null);
    setShowReview(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Loader2 size={36} className="text-blue-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50 dark:bg-gray-900">
      <AlertCircle size={48} className="text-orange-400" />
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {error === 'Quiz not found for the provided courseId.'
          ? 'No quiz available for this course yet.'
          : error}
      </p>
      <Link to={`/course/${courseId}`} className="text-blue-600 hover:underline">← Back to course</Link>
    </div>
  );

  const isLast = currentQuestion === quiz.questions.length - 1;
  const allAnswered = answers.every(a => a !== undefined);
  const percentage = result ? Math.round(result.percentage) : 0;
  const passed = result?.passed;

  // Result screen 
  if (result && !showReview) return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl px-4 mx-auto sm:px-6">
        <div className="p-8 text-center bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div className={`text-7xl font-bold mb-4 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {percentage}%
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Quiz Completed!</h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            {result.score} / {result.total} correct answers
          </p>

          {passed ? (
            <div className="p-6 mb-6 border-2 border-green-300 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-700">
              <Trophy size={32} className="mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="font-bold text-green-800 dark:text-green-200">🎉 Congratulations! You passed!</p>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Your certificate is now available for download.
              </p>
            </div>
          ) : (
            <div className="p-6 mb-6 border-2 border-yellow-300 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
              <p className="font-bold text-yellow-800 dark:text-yellow-200">Keep going! 📚</p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                You need at least {quiz.passingScore ?? 80}% to earn your certificate.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setShowReview(true)}
              className="flex-1 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700">
              Review Answers
            </button>
            {passed && (
              <button onClick={() => navigate('/certificates')}
                className="flex-1 py-3 font-bold text-white transition bg-green-600 rounded-xl hover:bg-green-700">
                🏅 My Certificates
              </button>
            )}
            <button onClick={handleRestart}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-purple-600 rounded-xl hover:bg-purple-700">
              <RotateCcw size={18} /> Retake
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-gray-600 rounded-xl hover:bg-gray-700">
              <Home size={18} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  //  Review screen 
  if (result && showReview) return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl px-4 mx-auto sm:px-6">
        <div className="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Answer Review</h2>
            <button onClick={() => setShowReview(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
          </div>
          <div className="space-y-5">
            {quiz.questions.map((q, idx) => {
              const correct = q.correctAnswer;
              const chosen = answers[idx];
              const isCorrect = chosen === correct;
              return (
                <div key={idx} className={`p-5 rounded-xl border-2 ${isCorrect ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'}`}>
                  <div className="flex gap-3">
                    {isCorrect
                      ? <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                      : <Circle size={20} className="flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Q{idx + 1}. {q.question}</p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Your answer: <span className={isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : 'text-red-700 dark:text-red-300 font-semibold'}>{q.options[chosen] ?? '—'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                          Correct: <span className="font-semibold">{q.options[correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={handleRestart}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700">
              <RotateCcw size={18} /> Retake
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white bg-gray-600 rounded-xl hover:bg-gray-700">
              <Home size={18} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  //  Quiz screen 
  const q = quiz.questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl px-4 mx-auto sm:px-6">

        {/* Header */}
        <div className="p-5 mb-6 bg-white shadow-md dark:bg-gray-800 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-yellow-500">
              <Clock size={16} /> {quiz.passingScore ?? 80}% to pass
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} / {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {answers.filter(a => a !== undefined).length} answered
            </span>
          </div>
          <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          {q.courseSection && (
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-blue-700 rounded-full bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300">
              {q.courseSection}
            </span>
          )}
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">{q.question}</h2>

          <div className="mb-6 space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion] === idx;
              return (
                <button key={idx} onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 rounded-xl text-left font-semibold transition border-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-transparent hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                  } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <span>{answers[currentQuestion] === idx ? '●' : ''}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            {/* Prev */}
            {currentQuestion > 0 && (
              <button onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="px-5 py-3 font-bold text-gray-700 transition bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200">
                ← Prev
              </button>
            )}

            {!isLast ? (
              <button onClick={handleNext} disabled={!answered}
                className="flex-1 py-3 font-bold text-white transition bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : '✓'}
                {submitting ? 'Submitting…' : allAnswered ? 'Submit Quiz' : `Answer all questions first`}
              </button>
            )}
          </div>
        </div>

        {/* Question dots navigation */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {quiz.questions.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                idx === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[idx] !== undefined
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-white dark:bg-gray-700 text-gray-500 border border-gray-200 dark:border-gray-600'
              }`}>
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}