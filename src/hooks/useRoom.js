import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { memberData } from '../lib/rooms'
import { isValidCode } from '../lib/roomCode'

// status: loading | ok | missing | kicked | closed | error
export function useRoom(code, user) {
  const [state, setState] = useState({ status: 'loading', room: null })

  useEffect(() => {
    if (!isValidCode(code)) {
      setState({ status: 'missing', room: null })
      return
    }
    setState({ status: 'loading', room: null })
    let unsub = () => {}
    let cancelled = false

    ;(async () => {
      try {
        const ref = doc(db, 'rooms', code)
        const snap = await getDoc(ref)
        if (cancelled) return
        if (!snap.exists()) return setState({ status: 'missing', room: null })
        if (snap.data().kicked?.includes(user.uid)) return setState({ status: 'kicked', room: null })

        await setDoc(doc(ref, 'members', user.uid), memberData(user), { merge: true })
        if (cancelled) return

        unsub = onSnapshot(
          ref,
          (s) => {
            if (!s.exists()) return setState({ status: 'closed', room: null })
            const room = { id: s.id, ...s.data() }
            if (room.kicked?.includes(user.uid)) return setState({ status: 'kicked', room: null })
            setState({ status: 'ok', room })
          },
          () => setState({ status: 'error', room: null }),
        )
      } catch (e) {
        console.error(e)
        if (!cancelled) setState({ status: 'error', room: null })
      }
    })()

    return () => {
      cancelled = true
      unsub()
    }
  }, [code, user.uid])

  return state
}
