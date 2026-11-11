import {
  arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp,
  setDoc, updateDoc, writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { generateRoomCode } from './roomCode'

export const nameOf = (user) =>
  user?.displayName || user?.email?.split('@')[0] || 'Guest'

export const memberData = (user) => ({
  name: nameOf(user),
  photoURL: user.photoURL || null,
  joinedAt: serverTimestamp(),
})

export async function createRoom(user) {
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode()
    const ref = doc(db, 'rooms', code)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, {
      hostId: user.uid,
      hostName: nameOf(user),
      kicked: [],
      createdAt: serverTimestamp(),
    })
    // Sequential on purpose: security rules check the member doc for later writes.
    await setDoc(doc(ref, 'members', user.uid), memberData(user))
    await setDoc(doc(ref, 'meta', 'playback'), {
      videoId: null,
      state: 'paused',
      position: 0,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    })
    return code
  }
  throw new Error('Could not allocate a room code. Please try again.')
}

export async function kickUser(code, uid) {
  const ref = doc(db, 'rooms', code)
  await updateDoc(ref, { kicked: arrayUnion(uid) }) // blocks rejoining
  await deleteDoc(doc(ref, 'members', uid)) // revokes access immediately
}

async function wipeCollection(ref, skipId) {
  const snap = await getDocs(ref)
  const docs = snap.docs.filter((d) => d.id !== skipId)
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

export async function deleteRoom(code, hostUid) {
  const ref = doc(db, 'rooms', code)
  await wipeCollection(collection(ref, 'messages'))
  await wipeCollection(collection(ref, 'reactions'))
  await wipeCollection(collection(ref, 'meta'))
  await wipeCollection(collection(ref, 'members'), hostUid)
  await deleteDoc(ref)
  await deleteDoc(doc(ref, 'members', hostUid))
}
