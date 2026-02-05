import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types/types'

interface AuthContextType {
    user: User | null
    supabaseUser: SupabaseUser | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    resetPassword: (email: string) => Promise<{ error: Error | null }>
    updatePassword: (password: string) => Promise<{ error: Error | null }>
    updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
    message: { text: string; type: 'success' | 'error' | 'info' } | null
    setMessage: (msg: { text: string; type: 'success' | 'error' | 'info' } | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessageState] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

    const setMessage = (msg: { text: string; type: 'success' | 'error' | 'info' } | null) => {
        setMessageState(msg)
        if (msg) {
            setTimeout(() => setMessageState(null), 3000)
        }
    }

    // Fetch user profile from public.users table
    const fetchUserProfile = async (userId: string, authUser?: SupabaseUser) => {
        try {
            console.log('Fetching profile for user:', userId);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('Supabase error fetching profile:', error);
                throw error;
            }

            if (!data) {
                console.warn('No profile found in users table for ID:', userId);

                // CRITICAL FIX: If user exists in Auth but not in public.users, 
                // it means the trigger might have failed. Let's try to create it here.
                if (authUser) {
                    console.log('Attempting to create missing profile from frontend...');
                    const { data: newData, error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: userId,
                            email: authUser.email!,
                            full_name: authUser.user_metadata?.full_name || 'User',
                            role: authUser.user_metadata?.role || 'buyer'
                        })
                        .select()
                        .maybeSingle();

                    if (insertError) {
                        console.error('Failed to create missing profile:', insertError);
                        // Return fallback profile from auth metadata as a last resort
                        return {
                            id: userId,
                            email: authUser.email!,
                            full_name: authUser.user_metadata?.full_name || 'User',
                            role: authUser.user_metadata?.role || 'buyer',
                            created_at: authUser.created_at,
                            is_phone_verified: false,
                            is_id_verified: false
                        } as User;
                    }
                    return newData as User;
                }
                return null;
            }

            console.log('Profile fetched successfully:', data);
            return data as User
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            const currentSupabaseUser = session?.user ?? null;
            setSupabaseUser(currentSupabaseUser)

            if (currentSupabaseUser) {
                fetchUserProfile(currentSupabaseUser.id, currentSupabaseUser).then(setUser)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            const currentSupabaseUser = session?.user ?? null;
            setSupabaseUser(currentSupabaseUser)

            if (currentSupabaseUser) {
                fetchUserProfile(currentSupabaseUser.id, currentSupabaseUser).then(setUser)
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Sign up new user
    const signUp = async (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => {
        try {
            console.log('Attempting signUp for:', email, 'as', role);
            const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
            console.log('Redirecting to:', siteUrl);

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                    emailRedirectTo: siteUrl,
                },
            })

            if (error) {
                console.error('Supabase signUp error details:', error);
                throw error;
            }

            console.log('Supabase signUp success, data:', data);
            return { error: null }
        } catch (error) {
            console.error('Catch signUp error:', error);
            return { error: error as Error }
        }
    }

    // Sign in existing user
    const signIn = async (email: string, password: string) => {
        try {
            console.log('Attempting signIn for:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Supabase signIn error details:', error);
                throw error;
            }

            console.log('Supabase signIn success, data:', data);
            setMessage({ text: 'Login successful!', type: 'success' })
            return { error: null }
        } catch (error) {
            console.error('Catch signIn error:', error);
            return { error: error as Error }
        }
    }

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            console.log('Attempting password reset for:', email);
            const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${siteUrl}/reset-password`,
            })

            if (error) {
                console.error('Supabase resetPassword error details:', error);
                throw error;
            }

            console.log('Supabase resetPassword success');
            return { error: null }
        } catch (error) {
            console.error('Catch resetPassword error:', error);
            return { error: error as Error }
        }
    }

    // Update password
    const updatePassword = async (password: string) => {
        try {
            console.log('Attempting password update');
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('Supabase updatePassword error details:', error);
                throw error;
            }

            console.log('Supabase updatePassword success');
            return { error: null }
        } catch (error) {
            console.error('Catch updatePassword error:', error);
            return { error: error as Error }
        }
    }

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSupabaseUser(null)
        setSession(null)
        setMessage({ text: 'Logged out successfully', type: 'info' })
    }

    // Update profile
    const updateProfile = async (updates: Partial<User>) => {
        try {
            if (!supabaseUser) throw new Error('No user logged in');

            console.log('Attempting profile update for:', supabaseUser.id, updates);
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', supabaseUser.id);

            if (error) {
                console.error('Supabase updateProfile error details:', error);
                throw error;
            }

            console.log('Supabase updateProfile success');
            await refreshUser();
            return { error: null }
        } catch (error) {
            console.error('Catch updateProfile error:', error);
            return { error: error as Error }
        }
    }

    // Refresh user profile
    const refreshUser = async () => {
        if (supabaseUser) {
            // Pass supabaseUser to ensure fallback is used if DB record isn't ready
            const profile = await fetchUserProfile(supabaseUser.id, supabaseUser)
            setUser(profile)
        }
    }

    const value = {
        user,
        supabaseUser,
        session,
        loading,
        signUp,
        signIn,
        resetPassword,
        updatePassword,
        updateProfile,
        signOut,
        refreshUser,
        message,
        setMessage
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
