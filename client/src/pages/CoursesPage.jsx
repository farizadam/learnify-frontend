import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import AnimatedPage from '../components/motion/AnimatedPage';
import CourseCard from '../components/CourseCard';
import SectionHeader from '../components/ui/SectionHeader';
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
    <AnimatedPage className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader
          title="Discover courses"
          subtitle={`${courses.length} curated course${courses.length !== 1 ? 's' : ''} across premium learning tracks.`}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search courses, skills, or instructors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>
          <div className="surface flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
            <SlidersHorizontal size={16} />
            Smart filters enabled
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200/60 bg-white/70 text-slate-600 hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="surface rounded-3xl p-5">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="mt-4 h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-6 h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-3xl border border-rose-200/60 bg-rose-50 px-6 py-5 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(course => (
                <CourseCard key={course._id || course.id} course={course} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-12">
                <EmptyState
                  title="No courses match yet"
                  message="Try adjusting your filters or searching by a different skill."
                />
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
}