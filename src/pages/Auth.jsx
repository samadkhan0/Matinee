import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Bulbs from '../components/Bulbs'

const MESSAGES = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'That email already has an account. Try signing in.',
  'auth/weak-password': 'Use at least 6 characters for the password.',
  'auth/invalid-email': 'That email address looks off.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection.',
}

export default function Auth() {
  const { user, loading, login, signup, google } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/lobby'
  const [mode, setMode] = useState('in')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to={from} replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const run = async (fn) => {
    setError('')
    setBusy(true)
    try {
      await fn()
      navigate(from, { replace: true })
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return
      setError(MESSAGES[e.code] || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    run(() =>
      mode === 'in'
        ? login(form.email, form.password)
        : signup(form.name.trim() || form.email.split('@')[0], form.email, form.password),
    )
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between border-r border-ink-700 bg-ink-900 p-12 lg:flex">
        <Logo size="text-3xl" />
        <div>
          <Bulbs count={14} className="mb-8 max-w-xs" />
          <p className="font-display text-6xl italic leading-[0.95]">
            “Save me<br />a seat.”
          </p>
          <p className="mt-6 max-w-xs text-paper-dim">Sign in and your next screening is one room code away.</p>
        </div>
        <p className="eyebrow">Matinee</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-7">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <p className="eyebrow">{mode === 'in' ? 'Welcome back' : 'New here'}</p>
            <h1 className="mt-2 font-display text-5xl italic">{mode === 'in' ? 'Sign in' : 'Get a ticket'}</h1>
          </div>

          {mode === 'up' && (
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="field" autoComplete="name" value={form.name} onChange={set('name')} placeholder="What should we call you?" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="field" autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} className="field" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} />
          </div>

          {error && <p role="alert" className="text-sm text-ember-soft">{error}</p>}

          <div className="space-y-3">
            <button className="btn-ember w-full" disabled={busy} type="submit">
              {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}
            </button>
            <button type="button" className="btn-ghost w-full" disabled={busy} onClick={() => run(google)}>
              Continue with Google
            </button>
          </div>

          <p className="text-sm text-paper-dim">
            {mode === 'in' ? 'No account yet? ' : 'Already have one? '}
            <button type="button" className="text-paper underline underline-offset-4 hover:text-ember" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError('') }}>
              {mode === 'in' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  )
}
