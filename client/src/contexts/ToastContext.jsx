import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-200/60 dark:border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-200',
    glow: 'shadow-[0_18px_40px_-28px_rgba(16,185,129,0.6)]',
  },
  error: {
    icon: AlertTriangle,
    ring: 'border-rose-200/60 dark:border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-200',
    glow: 'shadow-[0_18px_40px_-28px_rgba(244,63,94,0.6)]',
  },
  warning: {
    icon: AlertTriangle,
    ring: 'border-amber-200/60 dark:border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-200',
    glow: 'shadow-[0_18px_40px_-28px_rgba(245,158,11,0.6)]',
  },
  info: {
    icon: Info,
    ring: 'border-sky-200/60 dark:border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-200',
    glow: 'shadow-[0_18px_40px_-28px_rgba(56,189,248,0.6)]',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
            const Icon = styles.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`glass flex items-start gap-3 rounded-2xl border px-4 py-3 ${styles.ring} ${styles.glow}`}
              >
                <div className={`mt-0.5 rounded-full bg-white/70 p-1.5 dark:bg-slate-800/70 ${styles.text}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                  {toast.message}
                </div>
                <button
                  onClick={() => remove(toast.id)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
