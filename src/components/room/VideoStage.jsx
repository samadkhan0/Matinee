import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { parseVideoId } from '../../lib/youtube'

export function Screen({ containerRef, playback, ready, floaters }) {
  const empty = !playback?.videoId
  return (
    <div className="relative aspect-video overflow-hidden border border-ink-700 bg-black shadow-[0_0_80px_-20px_rgba(232,85,61,0.25)]">
      <div ref={containerRef} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />

      {(empty || !ready) && (
        <div className="absolute inset-0 grid place-items-center bg-ink-950 text-center">
          <div className="px-6">
            <p className="eyebrow">{ready ? 'Screen is dark' : 'Warming up the lamp'}</p>
            {ready && (
              <p className="mt-3 font-display text-3xl italic text-paper-dim sm:text-4xl">
                Paste a YouTube link below to roll the film.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {floaters.map((f) => (
            <motion.div
              key={f.id}
              className="absolute bottom-6 flex flex-col items-center"
              style={{ left: `${f.x}%` }}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -260, opacity: [0, 1, 1, 0], scale: 1.1, x: [0, 14, -10, 6] }}
              transition={{ duration: 3.4, ease: 'easeOut' }}
            >
              <span className="text-4xl drop-shadow">{f.emoji}</span>
              <span className="mt-1 rounded-sm bg-ink-950/70 px-1.5 font-mono text-[10px] text-paper-dim">{f.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function UrlBar({ onSubmit }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const id = parseVideoId(value)
    if (!id) return setError("That doesn't look like a YouTube link.")
    setError('')
    setValue('')
    onSubmit(id)
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-4">
      <div className="flex-1">
        <label className="label" htmlFor="yt">Now showing</label>
        <input
          id="yt"
          className="field font-mono text-sm"
          placeholder="https://youtube.com/watch?v=…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-ember-soft">{error}</p>}
      </div>
      <button className="btn-ghost shrink-0" type="submit">Cue it up</button>
    </form>
  )
}

const EMOJIS = ['🔥', '😂', '😮', '👏', '❤️', '😭']

export function ReactionBar({ onReact }) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow mr-2">React</span>
      {EMOJIS.map((e) => (
        <motion.button
          key={e}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onReact(e)}
          className="grid h-10 w-10 place-items-center border border-ink-700 bg-ink-900 text-xl transition-colors hover:border-brass"
          aria-label={`React with ${e}`}
        >
          {e}
        </motion.button>
      ))}
    </div>
  )
}
