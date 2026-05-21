function Input({
  label,
  icon: Icon,
  error,
  as = 'input',
  className = '',
  ...props
}) {
  const Component = as;

  return (
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
      {label && <span>{label}</span>}
      <div className="relative mt-2">
        {Icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </span>
        )}
        <Component
          className={`input ${Icon ? 'pl-11' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </label>
  );
}

export default Input;
