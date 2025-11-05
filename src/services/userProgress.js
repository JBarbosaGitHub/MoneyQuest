// User Progress Tracking Service
// Simple save/load functions for user progress in Firestore

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * Save user progress to Firestore
 * @param {string} userId - Firebase Auth user ID
 * @param {object} progressData - Progress data to save (e.g., { questsCompleted: [], level: 1, points: 100 })
 * @returns {Promise<void>}
 */
export async function saveUserProgress(userId, progressData) {
  if (!userId) {
    throw new Error('User ID is required to save progress')
  }

  try {
    const userProgressRef = doc(db, 'userProgress', userId)
    
    // Check if document exists
    const docSnap = await getDoc(userProgressRef)
    
    if (docSnap.exists()) {
      // Update existing progress
      await updateDoc(userProgressRef, {
        ...progressData,
        updatedAt: serverTimestamp()
      })
    } else {
      // Create new progress document
      await setDoc(userProgressRef, {
        ...progressData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error saving user progress:', error)
    throw error
  }
}

/**
 * Load user progress from Firestore
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<object|null>} Progress data or null if not found
 */
export async function loadUserProgress(userId) {
  if (!userId) {
    throw new Error('User ID is required to load progress')
  }

  try {
    const userProgressRef = doc(db, 'userProgress', userId)
    const docSnap = await getDoc(userProgressRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error loading user progress:', error)
    throw error
  }
}

/**
 * Update specific fields in user progress
 * @param {string} userId - Firebase Auth user ID
 * @param {object} updates - Fields to update (e.g., { points: 150 })
 * @returns {Promise<void>}
 */
export async function updateUserProgress(userId, updates) {
  if (!userId) {
    throw new Error('User ID is required to update progress')
  }

  try {
    const userProgressRef = doc(db, 'userProgress', userId)
    await updateDoc(userProgressRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user progress:', error)
    throw error
  }
}

/**
 * Initialize default progress for new users
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<void>}
 */
export async function initializeUserProgress(userId) {
  const defaultProgress = {
    level: 1,
    points: 0,
    questsCompleted: [],
    simulatorsUsed: [],
    consultasBooked: [],
    lastActive: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  await saveUserProgress(userId, defaultProgress)
}
