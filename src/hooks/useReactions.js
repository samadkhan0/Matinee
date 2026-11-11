import { useCallback, useEffect, useRef, useState } from 'react'
import {
  addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { nameOf } from '../lib/rooms'

// Reactions are synced to everyone in the room. Each is a tiny doc; the
// listener only reacts to docs that arrive after it attached.
export function useReactions(code, user) {
  const [floaters, setFloaters] = useState([])
  const lastSent = useRef(0)

  useEffect(() => {
    if (!code) return
    let first = true
    const q = query(
      collection(db, 'rooms', code, 'reactions'),
      orderBy('createdAt', 'desc'),
      limit(10),
    )
    return onSnapshot(
      q,
      (snap) => {
        if (first) {
          first = false
          return
        }
        snap.docChanges().forEach((ch) => {
          if (ch.type !== 'added') return
          const { emoji, name } = ch.doc.data()
          const id = ch.doc.id
          const x = 8 + Math.random() * 84
          setFloaters((f) => [...f.slice(-30), { id, emoji, name, x }])
          setTimeout(() => setFloaters((f) => f.filter((i) => i.id !== id)), 3800)
        })
      },
      () => {},
    )
  }, [code])

  const react = useCallback(
    (emoji) => {
      const now = Date.now()
      if (now - lastSent.current < 350) return // gentle rate limit
      lastSent.current = now
      addDoc(collection(db, 'rooms', code, 'reactions'), {
        uid: user.uid,
        name: nameOf(user),
        emoji,
        createdAt: serverTimestamp(),
        // Optional: add a Firestore TTL policy on this field to auto-clean.
        expireAt: Timestamp.fromMillis(now + 60 * 60 * 1000),
      }).catch(() => {})
    },
    [code, user],
  )

  return { floaters, react }
}
