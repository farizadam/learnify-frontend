import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link
      to="/courses"
      className="surface group flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition hover:-translate-y-1"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-3xl shadow-sm dark:bg-slate-900/70">
        {category.icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {category.name}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {category.count} courses
        </p>
      </div>
    </Link>
  );
}