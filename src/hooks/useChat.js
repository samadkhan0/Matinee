import { useCallback, useEffect, useState } from 'react'
import {
  addDoc, collection, limitToLast, onSnapshot, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { nameOf } from '../lib/rooms'

export function useChat(code, user) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!code) return
    const q = query(
      collection(db, 'rooms', code, 'messages'),
      orderBy('createdAt', 'asc'),
      limitToLast(200),
    )
    return onSnapshot(
      q,
      (snap) =>
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data({ serverTimestamps: 'estimate' }),
            pending: d.metadata.hasPendingWrites,
          })),
        ),
      () => setMessages([]),
    )
  }, [code])

  const send = useCallback(
    async (text) => {
      const clean = text.trim().slice(0, 500)
      if (!clean) return
      await addDoc(collection(db, 'rooms', code, 'messages'), {
        uid: user.uid,
        name: nameOf(user),
        photoURL: user.photoURL || null,
        text: clean,
        createdAt: serverTimestamp(),
      })
    },
    [code, user],
  )

  return { messages, send }
}
