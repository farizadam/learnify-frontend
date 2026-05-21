export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="surface rounded-3xl px-8 py-12 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {message && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
