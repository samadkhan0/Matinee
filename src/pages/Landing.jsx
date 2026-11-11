import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Bulbs from '../components/Bulbs'

const REELS = [
  ['01', 'In lockstep', 'Play, pause and seek are shared. Everyone is on the same frame, even if one of you is on bad hotel Wi-Fi.'],
  ['02', 'Talk over it', 'A running chat beside the screen, and reactions that float up for the whole room, not just you.'],
  ['03', 'Your house, your rules', 'The host can show someone out or end the night. Rooms are only reachable by their code.'],
]

export default function Landing() {
  const { user } = useAuth()
  const cta = user ? '/lobby' : '/auth'

  return (
    <>
      <Bulbs className="mx-auto max-w-7xl px-6 pt-6" />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-14 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-8">Now showing · wherever you all are</p>
          <h1 className="font-display text-[clamp(3.6rem,9.5vw,8.5rem)] leading-[0.9] tracking-tight">
            One screen.
            <br />
            <em className="text-ember">Many</em> couches.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper-dim">
            Matinee is a private screening room for YouTube. Open a room, hand out the code, and watch
            together, perfectly in sync, with the commentary you'd get on a real couch.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to={cta} className="btn-ember">{user ? 'Go to the lobby' : 'Get your ticket'}</Link>
            <a href="#how" className="btn-ghost">How it works</a>
          </div>
        </div>

        <div className="flex items-center justify-center lg:col-span-5">
          <motion.div
            initial={{ rotate: -9, y: 30, opacity: 0 }}
            animate={{ rotate: -4, y: 0, opacity: 1 }}
            whileHover={{ rotate: -1 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            className="ticket w-full max-w-sm p-8"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">Admit everyone</p>
            <p className="mt-6 font-display text-5xl italic leading-none">Friday<br />Night In</p>
            <div className="my-6 border-t-2 border-dashed border-ink-950/30" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-60">Room code</p>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-[0.12em]">A3C1B9F2</p>
            <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              <span>Seats: unlimited</span>
              <span>No. 0001</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how" className="border-t border-ink-700">
        <div className="mx-auto grid max-w-7xl gap-px px-6 md:grid-cols-3">
          {REELS.map(([n, title, body]) => (
            <div key={n} className="py-14 md:pr-10">
              <p className="font-mono text-sm text-brass">Reel {n}</p>
              <h3 className="mt-4 font-display text-4xl italic">{title}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-paper-dim">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-700 py-8 text-center">
        <p className="eyebrow">Matinee · made for people who miss the same couch</p>
      </footer>
    </>
  )
}
