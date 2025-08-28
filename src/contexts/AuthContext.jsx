import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        }
        setLoading(false)
      })?.catch(error => {
        console.error('Session error:', error)
        setLoading(false)
      })

    // Listen for auth changes - NEVER ASYNC callback
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session?.user)
          // For OAuth users, ensure profile exists
          if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider !== 'email') {
            ensureUserProfile(session?.user)  // Fire-and-forget, NO AWAIT
          } else {
            fetchUserProfile(session?.user?.id)  // Fire-and-forget, NO AWAIT
          }
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()

      if (error) {
        console.error('Profile fetch error:', error)

        // If profile doesn't exist (PGRST116 = no rows returned), try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create...')
          await ensureUserProfileExists(userId)
        }
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const ensureUserProfile = async (user) => {
    try {
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', user?.id)
        ?.single()

      if (fetchError && fetchError?.code !== 'PGRST116') {
        console.error('Error checking user profile:', fetchError)
        return
      }

      // If profile doesn't exist, create it (for OAuth users)
      if (!existingProfile) {
        const profileData = {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0],
          role: 'participant',
          profile_picture_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
          is_verified: user?.email_confirmed_at ? true : false
        }

        const { data: newProfile, error: createError } = await supabase
          ?.from('user_profiles')
          ?.insert([profileData])
          ?.select()
          ?.single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          return
        }

        setUserProfile(newProfile)
      } else {
        setUserProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  // Helper function to ensure profile exists for any user ID
  const ensureUserProfileExists = async (userId) => {
    try {
      // Get user data from auth.users
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user || user.id !== userId) {
        console.error('Cannot create profile: user not found or mismatch')
        return
      }

      await ensureUserProfile(user)
    } catch (error) {
      console.error('Error ensuring user profile exists:', error)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      setAuthError('')
      
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || '',
            role: userData?.role || 'participant',
            university: userData?.university || '',
            student_id: userData?.studentId || '',
            phone_number: userData?.phoneNumber || ''
          }
        }
      })

      if (error) {
        setAuthError(error?.message)
        return { error }
      }

      return { data }
    } catch (error) {
      const errorMsg = 'Failed to create account. Please try again.'
      setAuthError(errorMsg)
      return { error: { message: errorMsg } }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setAuthError('')
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) {
        setAuthError(error?.message)
        return { error }
      }

      return { data }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('AuthRetryableFetchError')) {
        setAuthError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.')
        return { error }
      }
      
      const errorMsg = 'Failed to sign in. Please try again.'
      setAuthError(errorMsg)
      return { error: { message: errorMsg } }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setAuthError('')

      // Check if we're in a popup or redirect flow
      const isPopup = window.opener !== null

      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: isPopup
        }
      })

      if (error) {
        // Handle specific OAuth errors
        if (error?.message?.includes('popup')) {
          setAuthError('Popup was blocked. Please allow popups and try again.')
        } else if (error?.message?.includes('network')) {
          setAuthError('Network error. Please check your connection and try again.')
        } else if (error?.message?.includes('cancelled')) {
          setAuthError('Sign-in was cancelled. Please try again.')
        } else {
          setAuthError(error?.message || 'Failed to sign in with Google.')
        }
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Google OAuth error:', error)

      // Handle different types of errors
      if (error?.name === 'AbortError') {
        setAuthError('Sign-in was cancelled. Please try again.')
      } else if (error?.message?.includes('Failed to fetch')) {
        setAuthError('Network error. Please check your connection and try again.')
      } else if (error?.message?.includes('popup')) {
        setAuthError('Popup was blocked. Please allow popups for this site and try again.')
      } else {
        setAuthError('Failed to sign in with Google. Please try again.')
      }

      return { error: { message: 'Google OAuth failed' } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase?.auth?.signOut()

      if (error) {
        console.error('Sign out error:', error)
        return
      }

      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setAuthError('')
      const { error } = await supabase?.auth?.resetPasswordForEmail(email)
      
      if (error) {
        setAuthError(error?.message)
        return { error }
      }

      return { success: true }
    } catch (error) {
      const errorMsg = 'Failed to send reset email. Please try again.'
      setAuthError(errorMsg)
      return { error: { message: errorMsg } }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) return { error: { message: 'No user logged in' } }

      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()

      if (error) {
        return { error }
      }

      setUserProfile(data)
      return { data }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    setAuthError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}