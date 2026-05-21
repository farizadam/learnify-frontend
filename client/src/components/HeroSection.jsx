import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock, Sparkles, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './common/Button';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
      <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="badge mb-6 inline-flex items-center gap-2 bg-white/10 text-white">
              <Sparkles size={14} /> Premium learning reimagined
            </span>
            <h1 className="text-5xl font-semibold leading-tight text-white md:text-6xl">
              Learn with the clarity of a modern product studio.
            </h1>
            <p className="mt-6 text-lg text-slate-200">
              Learnify blends elegant course experiences, progress intelligence, and instructor workflows in one
              premium platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/courses">
                <Button size="lg">
                  Explore Courses <ArrowUpRight size={18} />
                </Button>
              </Link>
              <Link to={user?.role === 'teacher' ? '/teacher-dashboard' : '/dashboard'}>
                <Button size="lg" variant="secondary">
                  {user?.role === 'teacher' ? 'Open Studio' : 'View Progress'}
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <div>
                <p className="text-2xl font-semibold text-white">320+</p>
                <p>Premium courses</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">48k</p>
                <p>Active learners</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">4.9/5</p>
                <p>Average satisfaction</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {[
              {
                icon: BookOpen,
                title: 'Expert-led paths',
                text: 'Curated tracks built with industry leaders.',
              },
              {
                icon: Clock,
                title: 'Pace that fits',
                text: 'Adaptive schedules and bite-sized lessons.',
              },
              {
                icon: User,
                title: 'Mentor feedback',
                text: 'Dedicated review loops and live sessions.',
                span: 'sm:col-span-2',
              },
            ].map(({ icon: Icon, title, text, span }) => (
              <div
                key={title}
                className={`glass rounded-3xl border border-white/20 p-6 text-white ${span || ''}`}
              >
                <Icon size={28} className="text-sky-200" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-200">{text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}