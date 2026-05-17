export default function ProgressBar({ progress }) {
  const done = progress === 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
        <span className={`text-sm font-semibold ${done ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {progress}%
        </span>
      </div>
      <div className="w-full h-2 overflow-hidden bg-gray-300 rounded-full dark:bg-gray-600">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            done
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}