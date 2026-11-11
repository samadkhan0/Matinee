import { useState } from 'react'
import Avatar from '../Avatar'

export default function PeoplePanel({ people, hostId, uid, isHost, onKick }) {
  const [confirming, setConfirming] = useState(null)

  return (
    <ul className="divide-y divide-ink-700 overflow-y-auto px-5">
      {people.map((p) => (
        <li key={p.uid} className="flex items-center gap-3 py-3">
          <Avatar name={p.name} photoURL={p.photoURL} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              {p.name} {p.uid === uid && <span className="text-paper-dim">(you)</span>}
            </p>
            {p.uid === hostId && <p className="eyebrow !text-[10px]">Host</p>}
          </div>
          {isHost && p.uid !== uid && (
            confirming === p.uid ? (
              <button
                className="eyebrow !text-ember"
                onClick={() => {
                  onKick(p.uid)
                  setConfirming(null)
                }}
              >
                Confirm
              </button>
            ) : (
              <button className="eyebrow hover:!text-ember" onClick={() => setConfirming(p.uid)}>
                Remove
              </button>
            )
          )}
        </li>
      ))}
      {people.length === 0 && <li className="py-6 text-sm text-paper-dim">Seats are filling…</li>}
    </ul>
  )
}
