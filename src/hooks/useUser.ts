import { useState, useEffect, useCallback } from 'react'
import { User } from '../types'

const STORAGE_KEY = 'wrld_user'
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      } catch (e) {
        console.error('Failed to parse user:', e)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
    setIsReady(true)
  }, [])

  // Quick sign up - no email needed
  const signUp = useCallback((username: string, displayName?: string) => {
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username.toLowerCase().trim(),
      displayName: displayName?.trim() || username.trim(),
      createdAt: Date.now()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    // Force a reload to ensure all components pick up the new user
    window.location.reload()
    return newUser
  }, [])

  // Update profile
  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Update avatar
  const updateAvatar = useCallback((avatarUrl: string) => {
    updateProfile({ avatar: avatarUrl })
  }, [updateProfile])

  // Sign out
  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    window.location.reload()
  }, [])

  // Refetch user from localStorage
  const refetchUser = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      } catch (e) {
        console.error('Failed to parse user:', e)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [])

  return {
    user,
    isLoading,
    isReady,
    isAuthenticated: !!user,
    signUp,
    updateProfile,
    updateAvatar,
    signOut,
    refetchUser
  }
}

export default useUser
