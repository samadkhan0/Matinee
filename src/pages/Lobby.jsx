import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { createRoom, nameOf } from '../lib/rooms'
import { isValidCode, normalizeCode } from '../lib/roomCode'

const greeting = () => {
  const h = new Date().getHours()
  return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Lobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      navigate(`/room/${await createRoom(user)}`)
    } catch (e) {
      console.error(e)
      setError('Could not open a room. Check your connection and try again.')
      setBusy(false)
    }
  }

  const join = (e) => {
    e.preventDefault()
    if (!isValidCode(code)) return setError('Room codes are 8 characters, 0–9 and A–F.')
    navigate(`/room/${code}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <p className="eyebrow">{greeting()}</p>
      <h1 className="mt-3 font-display text-6xl italic sm:text-7xl">{nameOf(user)}.</h1>
      <p className="mt-3 max-w-md text-paper-dim">What are we watching tonight?</p>

      <div className="mt-14 grid gap-px border border-ink-700 bg-ink-700 lg:grid-cols-2">
        <motion.section whileHover={{ backgroundColor: '#1b1917' }} className="bg-ink-900 p-10">
          <p className="font-mono text-sm text-brass">I.</p>
          <h2 className="mt-4 font-display text-5xl italic">Open a screening</h2>
          <p className="mt-3 max-w-sm text-paper-dim">
            Start a fresh room and get a code to hand out. You'll be the host.
          </p>
          <button onClick={create} disabled={busy} className="btn-ember mt-10">
            {busy ? 'Opening the doors…' : 'Create room'}
          </button>
        </motion.section>

        <motion.section whileHover={{ backgroundColor: '#1b1917' }} className="bg-ink-900 p-10">
          <p className="font-mono text-sm text-brass">II.</p>
          <h2 className="mt-4 font-display text-5xl italic">Have a ticket?</h2>
          <form onSubmit={join} className="mt-6 max-w-sm">
            <label className="label" htmlFor="code">Room code</label>
            <input
              id="code"
              className="field font-mono text-3xl uppercase tracking-[0.2em]"
              placeholder="A3C1B9F2"
              value={code}
              maxLength={8}
              autoComplete="off"
              onChange={(e) => { setCode(normalizeCode(e.target.value)); setError('') }}
            />
            <button className="btn-ghost mt-8" type="submit">Join room</button>
          </form>
        </motion.section>
      </div>

      {error && <p role="alert" className="mt-5 text-sm text-ember-soft">{error}</p>}
    </div>
  )
}
