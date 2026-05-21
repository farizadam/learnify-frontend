export default function ProgressBar({ progress }) {
  const done = progress === 100;
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
        <span className={`font-semibold ${done ? 'text-emerald-500' : 'text-sky-500'}`}>
          {progress}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            done
              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              : 'bg-gradient-to-r from-sky-400 to-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}