import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { nameOf } from '../lib/rooms'
import Avatar from '../components/Avatar'

const PW_ERRORS = {
  'auth/invalid-credential': 'Current password is incorrect.',
  'auth/wrong-password': 'Current password is incorrect.',
  'auth/weak-password': 'New password must be at least 6 characters.',
  'auth/requires-recent-login': 'Please sign in again, then retry.',
  'auth/too-many-requests': 'Too many attempts. Try again shortly.',
}

function Note({ note }) {
  if (!note) return null
  return <p role="status" className={`text-sm ${note.ok ? 'text-brass' : 'text-ember-soft'}`}>{note.text}</p>
}

export default function Profile() {
  const { user, updateName, changePassword, hasPassword } = useAuth()
  const [name, setName] = useState(nameOf(user))
  const [phone, setPhone] = useState('')
  const [profileNote, setProfileNote] = useState(null)
  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwNote, setPwNote] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then((s) => s.exists() && setPhone(s.data().phone || ''))
  }, [user.uid])

  const saveProfile = async (e) => {
    e.preventDefault()
    setBusy(true)
    setProfileNote(null)
    try {
      await updateName(name.trim() || nameOf(user))
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        phone: phone.trim().slice(0, 24),
        updatedAt: serverTimestamp(),
      })
      setProfileNote({ ok: true, text: 'Saved.' })
    } catch {
      setProfileNote({ ok: false, text: 'Could not save your profile.' })
    }
    setBusy(false)
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setBusy(true)
    setPwNote(null)
    try {
      await changePassword(pw.current, pw.next)
      setPw({ current: '', next: '' })
      setPwNote({ ok: true, text: 'Password updated.' })
    } catch (err) {
      setPwNote({ ok: false, text: PW_ERRORS[err.code] || 'Could not change your password.' })
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-center gap-5">
        <Avatar name={nameOf(user)} photoURL={user.photoURL} size={64} />
        <div>
          <p className="eyebrow">Your profile</p>
          <h1 className="font-display text-5xl italic">{nameOf(user)}</h1>
          <p className="text-sm text-paper-dim">{user.email}</p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="mt-14 space-y-7 border-t border-ink-700 pt-10">
        <h2 className="font-display text-3xl italic">Details</h2>
        <div>
          <label className="label" htmlFor="pname">Display name</label>
          <input id="pname" className="field" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone (private, optional)</label>
          <input id="phone" type="tel" className="field" value={phone} maxLength={24} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Note note={profileNote} />
        <button className="btn-ember" disabled={busy}>Save details</button>
      </form>

      <form onSubmit={savePassword} className="mt-14 space-y-7 border-t border-ink-700 pt-10">
        <h2 className="font-display text-3xl italic">Password</h2>
        {hasPassword ? (
          <>
            <div>
              <label className="label" htmlFor="cur">Current password</label>
              <input id="cur" type="password" required className="field" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="new">New password</label>
              <input id="new" type="password" required minLength={6} className="field" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </div>
            <Note note={pwNote} />
            <button className="btn-ghost" disabled={busy}>Change password</button>
          </>
        ) : (
          <p className="text-paper-dim">You signed in with Google, so there's no password to manage here.</p>
        )}
      </form>
    </div>
  )
}
