import { BookOpen, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <div className="py-20 text-white bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
              Learn Anything, Become Anything
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Join millions of learners and unlock your potential with our world-class courses from industry experts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="px-8 py-3 font-bold text-blue-600 transition bg-white rounded-lg hover:bg-gray-100"
              >
                Start Learning Today
              </Link>
              {user?.role === 'teacher' ? (
                <Link
                  to="/teacher-dashboard"
                  className="px-8 py-3 font-bold text-white transition border rounded-lg bg-white/20 hover:bg-white/30 border-white/40"
                >
                  My Dashboard
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 font-bold text-white transition border rounded-lg bg-white/20 hover:bg-white/30 border-white/40"
                >
                  My Progress
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-6 transition border rounded-lg bg-white/20 backdrop-blur-lg hover:bg-white/30 border-white/30">
              <BookOpen size={40} className="mb-4 text-white" />
              <h3 className="mb-2 text-xl font-bold text-white">Expert Instructors</h3>
              <p className="text-blue-100">Learn from industry professionals</p>
            </div>
            <div className="p-6 transition border rounded-lg bg-white/20 backdrop-blur-lg hover:bg-white/30 border-white/30">
              <Clock size={40} className="mb-4 text-white" />
              <h3 className="mb-2 text-xl font-bold text-white">Learn at Your Pace</h3>
              <p className="text-blue-100">Complete courses whenever you want</p>
            </div>
            <div className="p-6 transition border rounded-lg bg-white/20 backdrop-blur-lg hover:bg-white/30 border-white/30 md:col-span-2">
              <User size={40} className="mb-4 text-white" />
              <h3 className="mb-2 text-xl font-bold text-white">Lifetime Access</h3>
              <p className="text-blue-100">Get lifetime access to all course materials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}