import { useEffect, useRef, useState } from 'react'

const time = (m) =>
  m.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? ''

export default function ChatPanel({ messages, send, uid }) {
  const [text, setText] = useState('')
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    send(text).catch(() => {})
    setText('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center font-display text-2xl italic text-paper-dim">
            No whispering yet.<br />Say something.
          </p>
        )}
        {messages.map((m, i) => {
          const grouped = messages[i - 1]?.uid === m.uid
          const mine = m.uid === uid
          return (
            <div key={m.id} className={m.pending ? 'opacity-60' : ''}>
              {!grouped && (
                <p className="mb-1 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-wider">
                  <span className={mine ? 'text-ember' : 'text-brass'}>{mine ? 'You' : m.name}</span>
                  <span className="text-ink-600">{time(m)}</span>
                </p>
              )}
              <p className="break-words text-[15px] leading-snug text-paper">{m.text}</p>
            </div>
          )
        })}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="flex items-end gap-3 border-t border-ink-700 px-5 py-3">
        <input
          className="field text-sm"
          placeholder="Whisper to the room…"
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="eyebrow pb-3 !text-ember hover:!text-ember-soft" type="submit">Send</button>
      </form>
    </div>
  )
}
