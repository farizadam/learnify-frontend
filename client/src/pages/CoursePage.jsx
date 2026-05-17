import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen, Users, CheckCircle, Loader2,
  File, Film, Eye, EyeOff, ChevronDown, ChevronUp,
  GraduationCap, Play, CheckCircle2, Circle
} from 'lucide-react';
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
    <div className={`border rounded-xl overflow-hidden transition
      ${completed
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40'
      }`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {lesson.fileType === 'pdf'
          ? <File size={16} className="flex-shrink-0 text-red-500" />
          : lesson.fileType === 'video'
            ? <Film size={16} className="flex-shrink-0 text-purple-500" />
            : <BookOpen size={16} className="flex-shrink-0 text-blue-500" />
        }
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate dark:text-gray-200">
            {lesson.title}
          </p>
          {lesson.content && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{lesson.content}</p>
          )}
        </div>
        {lesson.fileType && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0
            ${lesson.fileType === 'pdf'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
            }`}>
            {lesson.fileType.toUpperCase()}
          </span>
        )}
        {/* Mark as complete button */}
        {isEnrolled && (
          <button
            onClick={toggleComplete}
            disabled={completed || loading}
            className={`flex-shrink-0 p-1.5 rounded-lg transition
              ${completed
                ? 'text-green-600 dark:text-green-400 cursor-default'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
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
    } catch (e) {
      alert(e.message);
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

  return (
    <div className="min-h-screen py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">

        {/* Back link */}
        <Link to="/courses" className="flex items-center gap-2 mb-6 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to courses
        </Link>

        {/* Course Header */}
        <div className="mb-8 overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          {/* Banner */}
          <div className="flex items-center justify-center h-52 bg-gradient-to-br from-blue-600 to-indigo-700">
            <GraduationCap size={72} className="text-white opacity-60" />
          </div>

          <div className="p-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {course.category && (
                <span className="px-3 py-1 text-sm font-semibold text-blue-700 rounded-full bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300">
                  {course.category}
                </span>
              )}
              {course.level && (
                <span className="px-3 py-1 text-sm font-semibold text-gray-600 capitalize bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {course.level}
                </span>
              )}
            </div>

            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              {course.title}
            </h1>

            {course.description && (
              <p className="mb-6 text-lg text-gray-500 dark:text-gray-400">
                {course.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 py-6 mb-6 border-gray-100 border-y dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Users size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Students enrolled</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <BookOpen size={20} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lessons</p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {instructor && (
              <div className="flex items-center gap-3 p-4 mb-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-bold text-white bg-blue-600 rounded-full">
                  {instructor.firstName?.[0]}{instructor.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {instructor.firstName} {instructor.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Instructor</p>
                </div>
              </div>
            )}

            {/* Enroll Button + Quiz */}
            {user?.role === 'student' && (
              <div className="flex flex-wrap gap-3">
                {isEnrolled ? (
                  <div className="flex items-center gap-2 px-6 py-3 font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl">
                    <CheckCircle size={20} /> Enrolled
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="flex items-center gap-2 px-8 py-3 font-bold text-white transition bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-60"
                  >
                    {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                    {enrolling ? 'Enrolling…' : 'Enroll Now'}
                  </button>
                )}
                {isEnrolled && hasQuiz && (
                  <Link
                    to={`/course/${id}/quiz`}
                    className="flex items-center gap-2 px-8 py-3 font-bold text-white transition bg-purple-600 hover:bg-purple-700 rounded-xl"
                  >
                    📝 Take Quiz
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lessons Section */}
        <div className="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setShowLessons(v => !v)}
          >
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <BookOpen size={20} className="text-blue-500" />
              Course Curriculum
              <span className="text-sm font-normal text-gray-400">({totalLessons} lessons)</span>
            </h2>
            {showLessons ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </div>

          {showLessons && (
            <>
              {totalLessons === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
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

              {/* Message si pas enrolled */}
              {!isEnrolled && user?.role === 'student' && totalLessons > 0 && (
                <div className="p-5 mt-6 text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="mb-3 font-semibold text-blue-700 dark:text-blue-300">
                    Enroll to access lesson content and PDFs
                  </p>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-60"
                  >
                    {enrolling ? 'Enrolling…' : 'Enroll Now'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}