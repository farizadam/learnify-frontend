function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent dark:border-slate-600" />
      {label}
    </div>
  );
}

export default Loader;
