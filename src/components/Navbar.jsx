import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const link = ({ isActive }) =>
    `eyebrow transition-colors hover:text-paper ${isActive ? '!text-paper' : ''}`

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo to={user ? '/lobby' : '/'} />
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <NavLink to="/lobby" className={link}>Lobby</NavLink>
              <NavLink to="/profile" className={link}>
                <span className="flex items-center gap-2">
                  <Avatar name={user.displayName || user.email || '?'} photoURL={user.photoURL} size={24} />
                  <span className="hidden sm:inline">Profile</span>
                </span>
              </NavLink>
              <button
                className="eyebrow transition-colors hover:text-ember"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="eyebrow transition-colors hover:text-paper">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
