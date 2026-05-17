import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link
      to="/courses"
      className="block p-6 text-center transition transform bg-white rounded-lg shadow-lg cursor-pointer dark:bg-gray-800 hover:shadow-xl hover:scale-105"
    >
      <div className="mb-4 text-5xl">{category.icon}</div>
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        {category.name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {category.count} courses
      </p>
    </Link>
  );
}