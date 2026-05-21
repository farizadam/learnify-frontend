export default function Skeleton({ className = '', rounded = 'rounded-2xl' }) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}
