import { useEffect, useState } from 'react'
import { onDisconnect, onValue, ref, remove, serverTimestamp, set } from 'firebase/database'
import { rtdb } from '../lib/firebase'
import { nameOf } from '../lib/rooms'

// Presence lives in Realtime Database because onDisconnect() is run by the
// server: closing the tab, losing Wi-Fi or crashing the browser all still
// remove the user. Firestore has no equivalent.
export function usePresence(code, user) {
  const [people, setPeople] = useState([])

  useEffect(() => {
    if (!code) return
    const me = ref(rtdb, `presence/${code}/${user.uid}`)

    const offConn = onValue(ref(rtdb, '.info/connected'), (snap) => {
      if (snap.val() !== true) return
      onDisconnect(me)
        .remove()
        .then(() =>
          set(me, { name: nameOf(user), photoURL: user.photoURL || null, joinedAt: serverTimestamp() }),
        )
    })

    const offList = onValue(
      ref(rtdb, `presence/${code}`),
      (snap) => {
        const v = snap.val() || {}
        setPeople(
          Object.entries(v)
            .map(([uid, d]) => ({ uid, ...d }))
            .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
        )
      },
      () => setPeople([]),
    )

    return () => {
      offConn()
      offList()
      remove(me).catch(() => {})
    }
  }, [code, user.uid])

  return people
}
