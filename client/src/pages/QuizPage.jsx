import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Circle, Clock, Home, Loader2, RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedPage from '../components/motion/AnimatedPage';

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
  const [timeLeft, setTimeLeft] = useState(null);

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

  useEffect(() => {
    if (!quiz) return;
    const totalSeconds = Math.max(60, (quiz.timeLimit ?? 15) * 60);
    setTimeLeft(totalSeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

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
    <AnimatedPage className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={36} className="text-sky-500 animate-spin" />
      </div>
    </AnimatedPage>
  );

  if (error) return (
    <AnimatedPage className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-amber-400" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          {error === 'Quiz not found for the provided courseId.'
            ? 'No quiz available for this course yet.'
            : error}
        </p>
        <Link to={`/course/${courseId}`} className="text-sky-500 hover:underline">Back to course</Link>
      </div>
    </AnimatedPage>
  );

  const isLast = currentQuestion === quiz.questions.length - 1;
  const allAnswered = answers.every(a => a !== undefined);
  const percentage = result ? Math.round(result.percentage) : 0;
  const passed = result?.passed;
  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
  const seconds = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null;

  // Result screen 
  if (result && !showReview) return (
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="surface rounded-3xl p-8 text-center">
          <div className={`text-6xl font-semibold mb-4 ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
            {percentage}%
          </div>
          <h2 className="mb-2 text-3xl font-semibold text-slate-900 dark:text-white">Quiz completed</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            {result.score} / {result.total} correct answers
          </p>

          {passed ? (
            <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-emerald-50 px-6 py-4 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <Trophy size={30} className="mx-auto mb-2" />
              <p className="font-semibold">Congratulations! You passed.</p>
              <p className="mt-1 text-xs">Your certificate is now available.</p>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50 px-6 py-4 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-semibold">Keep going!</p>
              <p className="mt-1 text-xs">You need {quiz.passingScore ?? 80}% to earn a certificate.</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => setShowReview(true)} className="btn btn-secondary btn-md flex-1">
              Review answers
            </button>
            {passed && (
              <button onClick={() => navigate('/certificates')} className="btn btn-primary btn-md flex-1">
                My certificates
              </button>
            )}
            <button onClick={handleRestart} className="btn btn-outline btn-md flex-1">
              <RotateCcw size={16} /> Retake
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-md flex-1">
              <Home size={16} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );

  //  Review screen 
  if (result && showReview) return (
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="surface rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Answer review</h2>
            <button onClick={() => setShowReview(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>
          </div>
          <div className="mt-6 space-y-4">
            {quiz.questions.map((q, idx) => {
              const correct = q.correctAnswer;
              const chosen = answers[idx];
              const isCorrect = chosen === correct;
              return (
                <div key={idx} className={`rounded-2xl border px-5 py-4 ${isCorrect ? 'border-emerald-200/60 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-rose-200/60 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10'}`}>
                  <div className="flex gap-3">
                    {isCorrect
                      ? <CheckCircle2 size={20} className="mt-0.5 text-emerald-500" />
                      : <Circle size={20} className="mt-0.5 text-rose-500" />}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Q{idx + 1}. {q.question}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Your answer: <span className={isCorrect ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{q.options[chosen] ?? '—'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="mt-1 text-sm text-emerald-600">
                          Correct: <span className="font-semibold">{q.options[correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={handleRestart} className="btn btn-outline btn-md flex-1">
              <RotateCcw size={16} /> Retake
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-md flex-1">
              <Home size={16} /> Dashboard
            </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );

  //  Quiz screen 
  const q = quiz.questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;

  return (
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="surface mb-6 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{quiz.title}</h1>
            <div className="flex items-center gap-2">
              {timeLeft !== null && (
                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Clock size={14} /> {minutes}:{seconds}
                </span>
              )}
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
                {quiz.passingScore ?? 80}% to pass
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Question {currentQuestion + 1} / {quiz.questions.length}</span>
            <span>{answers.filter(a => a !== undefined).length} answered</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="surface rounded-3xl p-8">
          {q.courseSection && (
            <span className="badge mb-4 inline-flex bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
              {q.courseSection}
            </span>
          )}
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">{q.question}</h2>

          <div className="mb-6 space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion] === idx;
              return (
                <button key={idx} onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                      : 'border-slate-200/60 bg-white/70 text-slate-900 hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-white dark:hover:bg-slate-800'
                  } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <span>●</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {currentQuestion > 0 && (
              <button onClick={() => setCurrentQuestion(currentQuestion - 1)} className="btn btn-secondary btn-md">
                Previous
              </button>
            )}

            {!isLast ? (
              <button onClick={handleNext} disabled={!answered} className="btn btn-primary btn-md flex-1 disabled:opacity-50">
                Next question
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="btn btn-primary btn-md flex-1 disabled:opacity-50">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit quiz'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {quiz.questions.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentQuestion(idx)}
              className={`h-8 w-8 rounded-full text-xs font-semibold transition ${
                idx === currentQuestion
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : answers[idx] !== undefined
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200'
                    : 'border border-slate-200/60 bg-white/70 text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300'
              }`}>
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}