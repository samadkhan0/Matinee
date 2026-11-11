import { Link } from 'react-router-dom'

export default function Logo({ to = '/', size = 'text-2xl' }) {
  return (
    <Link to={to} className={`font-display italic tracking-tight ${size}`}>
      Matinee<span className="text-ember">.</span>
    </Link>
  )
}
