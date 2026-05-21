import { useState } from 'react';
import CourseCard from './CourseCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CoursesCarousel({ courses }) {
  const [scrollPos, setScrollPos] = useState(0);

  const scroll = (direction) => {
    const container = document.getElementById('courses-carousel');
    const scrollAmount = 320;
    const newPos = scrollPos + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    setScrollPos(newPos);
  };

  return (
    <div className="relative">
      <div
        className="no-scrollbar flex gap-6 overflow-x-auto pb-6"
        id="courses-carousel"
      >
        {courses.map(course => (
          <div key={course._id || course.id} className="flex-shrink-0 w-full md:w-[45%] lg:w-[32%]">
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 to-transparent dark:from-slate-950/80" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 to-transparent dark:from-slate-950/80" />

      <button
        onClick={() => scroll('left')}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-lg transition hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white md:inline-flex"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-lg transition hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white md:inline-flex"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}