import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import CoursesCarousel from '../components/CoursesCarousel';
import CategoryCard from '../components/CategoryCard';

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
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-12 text-4xl font-bold text-center text-gray-900 dark:text-white">
            Featured Courses
          </h2>
          <CoursesCarousel courses={courses.slice(0, 6)} />
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-12 text-4xl font-bold text-center text-gray-900 dark:text-white">
            Explore Categories
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-white bg-blue-600 dark:bg-blue-900">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold">Ready to Start Learning?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Join thousands of students already learning on Learnify
          </p>
          <Link
            to="/courses"
            className="inline-block px-8 py-3 text-lg font-bold text-blue-600 transition bg-white rounded-lg hover:bg-gray-100"
          >
            Explore All Courses
          </Link>
        </div>
      </section>
    </div>
  );
}