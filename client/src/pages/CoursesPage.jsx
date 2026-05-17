import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Users, Star, Loader2 } from 'lucide-react';

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

function CourseCard({ course }) {
  const courseId = course._id || course.id;
  return (
    <div className="flex flex-col overflow-hidden transition-shadow bg-white border border-transparent shadow-md dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900">
      {/* Image placeholder */}
      <div className="flex items-center justify-center flex-shrink-0 h-44 bg-gradient-to-br from-blue-500 to-indigo-600">
        <BookOpen size={48} className="text-white opacity-70" />
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {course.category}
            </span>
          )}
          {course.level && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 capitalize">
              {course.level}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-auto mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {course.studentsEnrolled?.length ?? 0} students
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            {course.lessons?.length ?? 0} lessons
          </span>
        </div>

        {course.instructor && (
          <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
            By {course.instructor.firstName} {course.instructor.lastName}
          </p>
        )}

        <Link
          to={`/course/${courseId}`}
          className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const [coursesData, catsData] = await Promise.all([
          apiFetch('/courses'),
          apiFetch('/courses/categories'),
        ]);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setCategories(['All', ...(catsData.categories ?? [])]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = courses.filter(course => {
    const matchSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'All' || course.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">All Courses</h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">
          {courses.length} course{courses.length !== 1 ? 's' : ''} available
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full py-3 pr-4 text-gray-900 bg-white border border-gray-200 pl-11 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <Loader2 size={26} className="animate-spin" />
            <span>Loading courses…</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center text-red-500">⚠️ {error}</div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(course => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  No courses found. Try adjusting your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}