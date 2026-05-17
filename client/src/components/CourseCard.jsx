import { Star, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  const courseId = course._id || course.id;
  const instructorName = course.instructor?.name
    || (course.instructor?.firstName
      ? `${course.instructor.firstName} ${course.instructor.lastName}`
      : null);

  return (
    <div className="overflow-hidden transition-shadow bg-white border border-transparent shadow-md dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900">
      {course.image ? (
        <img src={course.image} alt={course.title} className="object-cover w-full h-44" />
      ) : (
        <div className="flex items-center justify-center flex-shrink-0 h-44 bg-gradient-to-br from-blue-500 to-indigo-600">
          <BookOpen size={48} className="text-white opacity-70" />
        </div>
      )}
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

        <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{course.title}</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>

        <div className="flex items-center gap-4 mt-auto mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {(course.studentsEnrolled?.length ?? course.students ?? 0).toLocaleString()} students
          </span>
          {course.rating && (
            <span className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              {course.rating}
            </span>
          )}
        </div>

        {instructorName && (
          <p className="mb-4 text-xs text-gray-400 dark:text-gray-500">
            By {instructorName}
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