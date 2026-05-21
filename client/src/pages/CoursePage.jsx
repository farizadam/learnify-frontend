import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  File,
  Film,
  GraduationCap,
  Loader2,
  Play,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AnimatedPage from '../components/motion/AnimatedPage';
import ProgressBar from '../components/ProgressBar';

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

//  PDF / Video Viewer inline
function FileViewer({ lessonId, fileType }) {
  const [show, setShow] = useState(false);
  if (!fileType || !lessonId) return null;

  const fileUrl = `${API_BASE}/courses/lesson/${lessonId}/file?token=${getToken()}`;

  return (
    <div className="mt-3">
      <button
        onClick={() => setShow(v => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
      >
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
        {show ? 'Hide' : 'View'} {fileType.toUpperCase()}
      </button>

      {show && (
        <div className="mt-3 overflow-hidden border border-gray-200 rounded-xl dark:border-gray-600">
          {fileType === 'pdf' ? (
            <iframe
              src={fileUrl}
              title="PDF"
              className="w-full"
              style={{ height: '500px' }}
            />
          ) : (
            <video src={fileUrl} controls className="w-full bg-black max-h-72" />
          )}
        </div>
      )}
    </div>
  );
}

//Lesson Item 
function LessonItem({ lesson, isEnrolled, userId }) {
  const lessonId = lesson._id || lesson.id;
  const [completed, setCompleted] = useState(
    lesson.studentsCompleted?.some(s => (s._id || s) === userId) ?? false
  );
  const [loading, setLoading] = useState(false);

  const toggleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/courses/lesson/${lessonId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCompleted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border transition
      ${completed
        ? 'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
        : 'border-slate-200/60 bg-white/70 dark:border-slate-700/60 dark:bg-slate-900/70'
      }`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {lesson.fileType === 'pdf'
          ? <File size={16} className="flex-shrink-0 text-red-500" />
          : lesson.fileType === 'video'
            ? <Film size={16} className="flex-shrink-0 text-purple-500" />
            : <BookOpen size={16} className="flex-shrink-0 text-blue-500" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate dark:text-slate-100">
            {lesson.title}
          </p>
          {lesson.content && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{lesson.content}</p>
          )}
        </div>
        {lesson.fileType && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0
            ${lesson.fileType === 'pdf'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-200'
              : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-200'
            }`}>
            {lesson.fileType.toUpperCase()}
          </span>
        )}
        {/* Mark as complete button */}
        {isEnrolled && (
          <button
            onClick={toggleComplete}
            disabled={completed || loading}
            className={`flex-shrink-0 rounded-2xl p-1.5 transition
              ${completed
                ? 'text-emerald-600 dark:text-emerald-300 cursor-default'
                : 'text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500'
              }`}
            title={completed ? 'Completed' : 'Mark as complete'}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : completed
                ? <CheckCircle2 size={16} />
                : <Circle size={16} />
            }
          </button>
        )}
      </div>

      {/* Viewer — uniquement si enrolled */}
      {isEnrolled && (
        <div className="px-4 pb-3">
          <FileViewer lessonId={lessonId} fileType={lesson.fileType} />
        </div>
      )}
    </div>
  );
}

// Main Page
export default function CoursePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { push } = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showLessons, setShowLessons] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [courseData, lessonsData] = await Promise.all([
          apiFetch(`/courses/${id}`),
          apiFetch(`/courses/${id}/lessons`),
        ]);

        // Vérifier si un quiz existe pour ce cours
        try {
          await apiFetch(`/quizzes/course/${id}`);
          setHasQuiz(true);
        } catch {
          setHasQuiz(false); // 404 → pas de quiz
        }
        setCourse(courseData);
        setLessons(lessonsData.lessons ?? lessonsData);

        // Check si l'utilisateur est déjà enrolled
        const userId = user?._id || user?.id;
        const enrolled = courseData.studentsEnrolled?.some(
          s => (s._id || s) === userId
        );
        setIsEnrolled(enrolled);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await apiFetch(`/courses/${id}/enroll`, { method: 'POST' });
      setIsEnrolled(true);
      setCourse(prev => ({
        ...prev,
        studentsEnrolled: [...(prev.studentsEnrolled ?? []), user?._id || user?.id],
      }));
      push('Enrollment confirmed. Your lessons are unlocked.', 'success');
    } catch (e) {
      push(e.message || 'Unable to enroll right now.', 'error');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Loader2 size={36} className="text-blue-500 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="mb-4 text-xl text-red-500">{error}</p>
        <Link to="/courses" className="text-blue-600 hover:underline">← Back to courses</Link>
      </div>
    </div>
  );

  if (!course) return null;

  const instructor = course.instructor;
  const totalStudents = course.studentsEnrolled?.length ?? 0;
  const totalLessons = lessons.length;
  const userId = user?._id || user?.id;
  const completedLessons = lessons.filter(l =>
    l.studentsCompleted?.some(s => (s._id || s) === userId)
  ).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} /> Back to courses
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface overflow-hidden rounded-3xl">
            <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500">
              <GraduationCap size={72} className="text-white/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent" />
            </div>

            <div className="p-8">
              <div className="flex flex-wrap gap-2">
                {course.category && (
                  <span className="badge bg-white/80 text-slate-700">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {course.description}
                </p>
              )}

              <div className="mt-6 grid gap-4 border-y border-slate-200/60 py-6 dark:border-slate-700/60 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-sky-500/10 p-2 text-sky-500">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{totalStudents}</p>
                    <p className="text-xs text-slate-500">Students enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-500/10 p-2 text-indigo-500">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{totalLessons}</p>
                    <p className="text-xs text-slate-500">Lessons inside</p>
                  </div>
                </div>
              </div>

              {(isEnrolled || user?.role === 'teacher') && (
                <div className="mt-6">
                  <ProgressBar progress={progress} />
                </div>
              )}

              {instructor && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {instructor.firstName?.[0]}{instructor.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {instructor.firstName} {instructor.lastName}
                    </p>
                    <p className="text-xs text-slate-400">Instructor</p>
                  </div>
                </div>
              )}

              {user?.role === 'student' && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {isEnrolled ? (
                    <div className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                      <CheckCircle size={14} /> Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="btn btn-primary btn-md disabled:opacity-60"
                    >
                      {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                      {enrolling ? 'Enrolling...' : 'Enroll now'}
                    </button>
                  )}
                  {isEnrolled && hasQuiz && (
                    <Link to={`/course/${id}/quiz`} className="btn btn-secondary btn-md">
                      Take quiz
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="surface rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Course highlights</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Structured learning path with interactive checkpoints.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Upload-ready lessons with PDF and video support.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Certificate-ready assessments once you pass the quiz.
              </div>
            </div>

            {(isEnrolled || user?.role === 'teacher') && (
              <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-700/60 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-wide text-slate-400">Your progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{progress}%</p>
                <p className="mt-1 text-xs text-slate-500">{completedLessons} lessons completed</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 surface rounded-3xl p-6">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setShowLessons(v => !v)}
          >
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <BookOpen size={20} className="text-sky-500" />
              Course curriculum
              <span className="text-sm font-normal text-slate-400">({totalLessons} lessons)</span>
            </h2>
            {showLessons ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
          </div>

          {showLessons && (
            <>
              {totalLessons === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No lessons yet.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {lessons.map(lesson => (
                    <LessonItem
                      key={lesson._id || lesson.id}
                      lesson={lesson}
                      isEnrolled={isEnrolled || user?.role === 'teacher'}
                      userId={user?._id || user?.id}
                    />
                  ))}
                </div>
              )}

              {!isEnrolled && user?.role === 'student' && totalLessons > 0 && (
                <div className="mt-6 rounded-2xl border border-sky-200/60 bg-sky-50 px-6 py-5 text-center text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                  <p className="mb-3 font-semibold">Enroll to access lesson content and resources.</p>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="btn btn-primary btn-md disabled:opacity-60"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll now'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}