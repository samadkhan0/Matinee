import { Link } from 'react-router-dom'

const COPY = {
  missing: ['No such screening', "We couldn't find a room with that code. Check it and try again."],
  kicked: ['You were shown out', 'The host removed you from this screening.'],
  closed: ['The house lights are up', 'The host closed this room. Thanks for watching.'],
  error: ['Projector jam', 'Something went wrong loading this room. Please try again.'],
}

export default function RoomNotice({ kind }) {
  const [title, body] = COPY[kind] || COPY.error
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Matinee</p>
        <h1 className="mt-4 font-display text-5xl italic sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-sm text-paper-dim">{body}</p>
        <Link to="/lobby" className="btn-ember mt-8 inline-block">Back to the lobby</Link>
      </div>
    </div>
  )
}
