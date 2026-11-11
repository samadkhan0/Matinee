const TONES = ['#c9a15b', '#e8553d', '#8a9a6b', '#b8745a', '#9a8f7a', '#d4915d']

export default function Avatar({ name = '?', photoURL, size = 32 }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const tone = TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length]
  const style = { width: size, height: size, fontSize: size * 0.42 }
  if (photoURL) {
    return <img src={photoURL} alt="" referrerPolicy="no-referrer" style={style} className="rounded-full object-cover" />
  }
  return (
    <span
      style={{ ...style, background: tone }}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display text-ink-950"
    >
      {initial}
    </span>
  )
}
