export default function Bulbs({ count = 28, className = '' }) {
  return (
    <div className={`flex justify-between ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="bulb" style={{ animationDelay: `${(i % 7) * 0.3}s` }} />
      ))}
    </div>
  )
}
