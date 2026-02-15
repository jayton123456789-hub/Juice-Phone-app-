import { useState, useEffect, useCallback } from 'react'
import { User } from '../types'

const STORAGE_KEY = 'juicephone_user'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse user:', e)
      }
    }
    setIsLoading(false)
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
  }, [])

  // Check if username is taken (simple local check)
  const isUsernameTaken = useCallback((username: string): boolean => {
    // In a real app, this would check against a server
    // For now, we just check if current user has this username
    return user?.username === username.toLowerCase().trim()
  }, [user])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    updateProfile,
    updateAvatar,
    signOut,
    isUsernameTaken
  }
}

export default useUser
