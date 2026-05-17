import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token'); }

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch tous les cours ET filtre les enrolled
        const data = await apiFetch('/courses');
        const list = Array.isArray(data) ? data : [];
        const userId = user?._id || user?.id;

        const enrolled = list.filter(c =>
          c.studentsEnrolled?.some(s => (s._id || s) === userId)
        );

        // Pour chaque cours enrolled, fetch les lessons pour calculer le progress
        const withProgress = await Promise.all(
          enrolled.map(async (course) => {
            try {
              const lessonsData = await apiFetch(`/courses/${course._id || course.id}/lessons`);
              const lessons = lessonsData.lessons ?? lessonsData;
              const completed = lessons.filter(l =>
                l.studentsCompleted?.some(s => (s._id || s) === userId)
              ).length;
              const progress = lessons.length > 0
                ? Math.round((completed / lessons.length) * 100)
                : 0;
              return { ...course, lessonsData: lessons, completed, progress };
            } catch {
              return { ...course, lessonsData: [], completed: 0, progress: 0 };
            }
          })
        );

        setEnrolledCourses(withProgress);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const totalLessons = enrolledCourses.reduce((s, c) => s + (c.lessonsData?.length ?? 0), 0);
  const completedLessons = enrolledCourses.reduce((s, c) => s + (c.completed ?? 0), 0);

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-12 text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Courses Enrolled</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {loading ? '…' : enrolledCourses.length}
                </p>
              </div>
              <BookOpen size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Completed</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {loading ? '…' : `${completedLessons}/${totalLessons}`}
                </p>
              </div>
              <TrendingUp size={40} className="text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Courses Passed</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {loading ? '…' : enrolledCourses.filter(c => c.progress === 100).length}
                </p>
              </div>
              <Clock size={40} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <Loader2 size={26} className="animate-spin" />
            <span>Loading your courses…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Enrolled Courses */}
            <div className="lg:col-span-2">
              <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  My Courses
                </h2>

                {enrolledCourses.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="mb-4 text-gray-500 dark:text-gray-400">
                      You haven't enrolled in any courses yet.
                    </p>
                    <Link
                      to="/courses"
                      className="px-6 py-2 font-bold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {enrolledCourses.map(course => {
                      const courseId = course._id || course.id;
                      const instructorName = course.instructor?.firstName
                        ? `${course.instructor.firstName} ${course.instructor.lastName}`
                        : course.instructor?.name || 'Instructor';
                      return (
                        <div
                          key={courseId}
                          className={`p-6 transition rounded-lg hover:shadow-lg border ${
                            course.progress === 100
                              ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {course.title}
                                </h3>
                                {course.progress === 100 && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                by {instructorName}
                              </p>
                            </div>
                            <span className={`text-lg font-bold ${
                              course.progress === 100
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {course.progress}%
                            </span>
                          </div>
                          <ProgressBar progress={course.progress} />
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.completed} of {course.lessonsData?.length ?? 0} lessons completed
                            </p>
                            <Link
                              to={`/course/${courseId}`}
                              className={`text-sm font-semibold hover:underline ${
                                course.progress === 100
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {course.progress === 100 ? 'Review →' : 'Continue →'}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Lessons */}
            <div className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Next Lessons
              </h2>

              {enrolledCourses.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming lessons.</p>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.flatMap(course =>
                    (course.lessonsData ?? [])
                      .filter(l => {
                        const userId = user?._id || user?.id;
                        return !l.studentsCompleted?.some(s => (s._id || s) === userId);
                      })
                      .slice(0, 1)
                      .map(lesson => ({
                        ...lesson,
                        courseName: course.title,
                        courseId: course._id || course.id,
                      }))
                  ).slice(0, 5).map(lesson => (
                    <Link
                      key={lesson._id || lesson.id}
                      to={`/course/${lesson.courseId}`}
                      className="block p-4 transition border border-gray-300 rounded-lg cursor-pointer dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {lesson.courseName}
                      </p>
                      <p className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {lesson.title}
                      </p>
                      {lesson.fileType && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded
                          ${lesson.fileType === 'pdf'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-purple-100 text-purple-600'
                          }`}>
                          {lesson.fileType.toUpperCase()}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}