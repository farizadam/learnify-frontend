export default function IconButton({ icon: Icon, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/60 bg-white/70 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white ${className}`}
    >
      <Icon size={18} />
    </button>
  );
}
