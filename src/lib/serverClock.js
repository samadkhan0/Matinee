import { ref, onValue } from 'firebase/database'
import { rtdb } from './firebase'

// Firebase tells us how far our clock is from the server's. Playback sync
// uses this so two people with different system clocks still agree on "now".
let offset = 0
onValue(ref(rtdb, '.info/serverTimeOffset'), (snap) => {
  offset = snap.val() || 0
})

export const serverNow = () => Date.now() + offset
