import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpen, GraduationCap, LayoutDashboard, Sparkles, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const items = [
    { to: '/', label: 'Overview', icon: Sparkles },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/certificates', label: 'Certificates', icon: Award },
    { to: '/teacher-dashboard', label: 'Teacher Studio', icon: GraduationCap, role: 'teacher' },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const navItems = items.filter((item) => !item.role || user?.role === item.role);

  const NavLink = ({ to, icon: Icon, label, onClick }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
          active
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <>
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-full lg:block">
        <div className="surface flex h-full flex-col rounded-3xl p-5">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Learnify Studio</p>
          </div>
          <nav className="flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>
          <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-slate-200">Upgrade learning</p>
            <p className="mt-1">Unlock premium analytics, cohorts, and live workshops.</p>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={onClose}
              role="presentation"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative h-full w-72 bg-white p-5 shadow-2xl dark:bg-slate-950"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Learnify Studio</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200/60 p-2 text-slate-600 transition hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink key={item.to} {...item} onClick={onClose} />
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
