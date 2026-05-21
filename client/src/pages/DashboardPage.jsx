import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import AnimatedPage from '../components/motion/AnimatedPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

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
    <AnimatedPage className="min-h-screen">
      <DashboardLayout
        title="Student dashboard"
        subtitle={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}. Your learning momentum lives here.`}
        actions={
          <Link to="/courses" className="btn btn-primary btn-sm">
            Browse courses
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={BookOpen}
            label="Courses enrolled"
            value={loading ? '...' : enrolledCourses.length}
            tone="sky"
          />
          <StatCard
            icon={TrendingUp}
            label="Lessons completed"
            value={loading ? '...' : `${completedLessons}/${totalLessons}`}
            tone="emerald"
          />
          <StatCard
            icon={Clock}
            label="Courses passed"
            value={loading ? '...' : enrolledCourses.filter(c => c.progress === 100).length}
            tone="amber"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="surface rounded-3xl p-6">
            <SectionHeader
              title="My courses"
              subtitle="Resume where you left off or review completed lessons."
            />

            {loading ? (
              <div className="mt-6 space-y-4">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200/60 p-4 dark:border-slate-700/60">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-3 h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="mt-8">
                <EmptyState
                  icon={BookOpen}
                  title="No enrolled courses yet"
                  message="Start exploring courses to build your learning plan."
                  action={
                    <Link to="/courses" className="btn btn-primary btn-md">
                      Browse courses
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {enrolledCourses.map(course => {
                  const courseId = course._id || course.id;
                  const instructorName = course.instructor?.firstName
                    ? `${course.instructor.firstName} ${course.instructor.lastName}`
                    : course.instructor?.name || 'Instructor';
                  return (
                    <div
                      key={courseId}
                      className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:bg-slate-900/70"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                              {course.title}
                            </h3>
                            {course.progress === 100 && (
                              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">by {instructorName}</p>
                        </div>
                        <span className="text-sm font-semibold text-sky-500">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="mt-4">
                        <ProgressBar progress={course.progress} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {course.completed} of {course.lessonsData?.length ?? 0} lessons completed
                        </span>
                        <Link
                          to={`/course/${courseId}`}
                          className="font-semibold text-slate-900 hover:text-indigo-500 dark:text-slate-200 dark:hover:text-indigo-300"
                        >
                          {course.progress === 100 ? 'Review' : 'Continue'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="surface rounded-3xl p-6">
            <SectionHeader
              title="Next lessons"
              subtitle="Lessons waiting for your next session."
            />
            <div className="mt-6 space-y-3">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-16 w-full" />
                ))
              ) : enrolledCourses.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming lessons yet.</p>
              ) : (
                enrolledCourses
                  .flatMap(course =>
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
                  )
                  .slice(0, 5)
                  .map(lesson => (
                    <Link
                      key={lesson._id || lesson.id}
                      to={`/course/${lesson.courseId}`}
                      className="flex flex-col gap-1 rounded-2xl border border-slate-200/60 bg-white/70 p-4 text-sm transition hover:-translate-y-0.5 dark:border-slate-700/60 dark:bg-slate-900/70"
                    >
                      <span className="text-xs uppercase tracking-wide text-slate-400">
                        {lesson.courseName}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {lesson.title}
                      </span>
                      {lesson.fileType && (
                        <span className="badge w-fit bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {lesson.fileType.toUpperCase()}
                        </span>
                      )}
                    </Link>
                  ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AnimatedPage>
  );
}