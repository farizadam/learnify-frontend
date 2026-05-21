import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-950 text-white dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-semibold">Learnify</h3>
            <p className="mt-3 text-sm text-slate-400">
              Premium e-learning experiences for ambitious learners and visionary educators.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Platform</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="transition hover:text-white">Home</Link></li>
              <li><Link to="/courses" className="transition hover:text-white">Courses</Link></li>
              <li><Link to="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
              <li><Link to="/profile" className="transition hover:text-white">Profile</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Resources</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="transition hover:text-white">Help Center</a></li>
              <li><a href="#" className="transition hover:text-white">Community</a></li>
              <li><a href="#" className="transition hover:text-white">Terms</a></li>
              <li><a href="#" className="transition hover:text-white">Privacy</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Mail size={16} /> hello@learnify.com</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +1 (555) 010-8899</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <p>&copy; 2026 Learnify. All rights reserved.</p>
          <p>Built for modern education teams.</p>
        </div>
      </div>
    </footer>
  );
}
