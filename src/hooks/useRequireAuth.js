import { useAuth } from '../contexts/AuthContext'

/**
 * Custom hook to conditionally require authentication
 * Use this when users need to be authenticated for specific actions like:
 * - Saving simulations
 * - Exporting data
 * - Scheduling consultations
 * 
 * @param {Function} onAuthRequired - Callback to open login modal
 * @returns {Object} - { requireAuth, isAuthenticated, currentUser }
 */
export function useRequireAuth(onAuthRequired) {
  const { currentUser } = useAuth()
  
  /**
   * Checks if user is authenticated before allowing an action
   * @param {Function} action - The action to perform if authenticated
   * @returns {Function} - Wrapped function that checks auth first
   */
  const requireAuth = (action) => {
    return (...args) => {
      if (!currentUser) {
        // User is not authenticated, trigger login
        if (onAuthRequired) {
          onAuthRequired()
        }
        return false
      }
      // User is authenticated, proceed with action
      return action(...args)
    }
  }
  
  return {
    requireAuth,
    isAuthenticated: !!currentUser,
    currentUser
  }
}
