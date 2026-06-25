import { createContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'
import type { UserDoc } from '../types/user'

const ADMIN_EMAIL = 'jasmongu@gmail.com'
const FIRESTORE_TIMEOUT = 4000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    ),
  ])
}

export interface AuthState {
  user: User | null
  userDoc: UserDoc | null
  isAdmin: boolean
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  user: null,
  userDoc: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = userDoc?.role === 'admin'

  useEffect(() => {
    // Si Firebase Auth no responde en 3s, dejar de mostrar loading
    const authTimeout = setTimeout(() => setLoading(false), 3000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(authTimeout)
      setUser(firebaseUser)

      if (firebaseUser) {
        const role = firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'viewer'
        const fallbackDoc: UserDoc = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL ?? '',
          role,
          tier: 'pro',
        } as UserDoc

        // Set fallback immediately so the app is usable while Firestore syncs
        setUserDoc(fallbackDoc)
        setLoading(false)

        // Sync with Firestore in background (non-blocking)
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const snap = await withTimeout(getDoc(userRef), FIRESTORE_TIMEOUT)

          if (!snap.exists()) {
            await withTimeout(setDoc(userRef, {
              ...fallbackDoc,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            }), FIRESTORE_TIMEOUT)
          } else {
            // Merge updated fields without blocking
            await withTimeout(setDoc(userRef, {
              role,
              displayName: firebaseUser.displayName ?? '',
              photoURL: firebaseUser.photoURL ?? '',
              lastLoginAt: serverTimestamp(),
            }, { merge: true }), FIRESTORE_TIMEOUT)
            // Use Firestore data if available
            const data = snap.data() as UserDoc
            setUserDoc({ ...data, uid: firebaseUser.uid, role })
          }
        } catch (e) {
          console.warn('Firestore sync skipped, using local data:', e)
        }
      } else {
        setUserDoc(null)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(authTimeout)
      unsubscribe()
    }
  }, [])

  const signIn = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUserDoc(null)
  }

  return (
    <AuthContext.Provider value={{ user, userDoc, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
