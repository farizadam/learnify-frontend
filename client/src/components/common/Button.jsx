const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
};

const SIZES = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

function Button({
  children,
  type = 'button',
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
