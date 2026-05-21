import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { to: '/', label: 'Home', icon: Sparkles },
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/certificates', label: 'Certificates', icon: Award },
      ...(user?.role === 'teacher'
        ? [{ to: '/teacher-dashboard', label: 'Teach', icon: GraduationCap }]
        : []),
      { to: '/profile', label: 'Profile', icon: User },
    ],
    [user?.role]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-sky-500/30">
              <GraduationCap size={20} />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Learnify</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Premium learning suite</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 text-sm font-medium transition ${
                    active
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm hidden lg:inline-flex"
            >
              <LogOut size={16} />
              Logout
            </button>
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 text-slate-600 transition hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/30 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 pb-4 pt-2">
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="btn btn-secondary btn-sm w-full justify-center"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
