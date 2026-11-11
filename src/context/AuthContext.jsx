import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import {
  EmailAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged,
  reauthenticateWithCredential, signInWithEmailAndPassword, signInWithPopup,
  signOut, updatePassword, updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [, rerender] = useReducer((n) => n + 1, 0)

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )

  const value = {
    user,
    loading,
    login: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    google: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
    async signup(name, email, pw) {
      const cred = await createUserWithEmailAndPassword(auth, email, pw)
      await updateProfile(cred.user, { displayName: name })
      rerender()
    },
    async updateName(name) {
      await updateProfile(auth.currentUser, { displayName: name })
      rerender()
    },
    async changePassword(current, next) {
      const u = auth.currentUser
      await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, current))
      await updatePassword(u, next)
    },
    hasPassword: !!user?.providerData.some((p) => p.providerId === 'password'),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
