import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CoursesCarousel from '../components/CoursesCarousel';
import CategoryCard from '../components/CategoryCard';
import AnimatedPage from '../components/motion/AnimatedPage';
import SectionHeader from '../components/ui/SectionHeader';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
function getToken() { return localStorage.getItem('token'); }

const CATEGORY_ICONS = {
  'Web Development': '🌐',
  'Mobile Apps': '📱',
  'Data Science': '📊',
  'Cloud Computing': '☁️',
  'Artificial Intelligence': '🤖',
  'Cybersecurity': '🔒',
};

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    fetch(`${API_BASE}/courses`, { headers })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setCourses(list);

        // Construire les catégories depuis les cours réels
        const catMap = {};
        list.forEach(c => {
          if (c.category) catMap[c.category] = (catMap[c.category] || 0) + 1;
        });
        const cats = Object.entries(catMap).map(([name, count], i) => ({
          id: i + 1,
          name,
          icon: CATEGORY_ICONS[name] || '📚',
          count,
        }));
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AnimatedPage className="min-h-screen">
      <HeroSection />

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured courses"
            subtitle="Curated experiences designed for focused mastery."
            action={(
              <Link to="/courses" className="btn btn-outline btn-sm">
                Explore all
              </Link>
            )}
          />

          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="surface rounded-3xl p-5">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="mt-4 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                    <Skeleton className="mt-6 h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <CoursesCarousel courses={courses.slice(0, 6)} />
            ) : (
              <EmptyState
                title="No courses yet"
                message="Your library will appear here once courses are published."
                action={
                  <Link to="/courses" className="btn btn-primary btn-md">
                    Browse catalog
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explore categories"
            subtitle="Move faster by choosing a focused path."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="surface-strong relative overflow-hidden rounded-3xl p-10">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-pink-500/10" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">
                  Build momentum with a learning system your team loves.
                </h2>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Capture progress, ship course milestones, and certify outcomes with beautiful dashboards.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/courses" className="btn btn-primary btn-lg">
                  Start learning <ArrowUpRight size={16} />
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  View progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}