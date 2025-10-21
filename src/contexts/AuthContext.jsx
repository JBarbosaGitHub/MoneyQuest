import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sign up with email, password and profile data
  const signup = async (email, password, profileData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update display name in Firebase Auth
    if (profileData.name) {
      await updateProfile(user, { displayName: profileData.name })
    }
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: profileData.name || '',
      birthDate: profileData.birthDate || '',
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return userCredential
  }

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Sign in with Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user
    
    // Check if user profile exists, if not create one
    const profile = await getUserProfile(user.uid)
    if (!profile) {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || '',
        birthDate: '',
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    return userCredential
  }

  // Sign out
  const logout = () => {
    return signOut(auth)
  }

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const profile = await getUserProfile(user.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
