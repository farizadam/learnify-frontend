import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ title, subtitle, actions, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <Sidebar open={open} onClose={() => setOpen(false)} />

          <div className="space-y-6">
            {(title || subtitle || actions) && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 text-slate-600 shadow-sm transition hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white lg:hidden"
                    aria-label="Open sidebar"
                  >
                    <Menu size={18} />
                  </button>
                  {actions}
                </div>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
