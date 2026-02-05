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
    signOut: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch user profile from public.users table
    const fetchUserProfile = async (userId: string) => {
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
            setSupabaseUser(session?.user ?? null)

            if (session?.user) {
                fetchUserProfile(session.user.id).then(setUser)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setSupabaseUser(session?.user ?? null)

            if (session?.user) {
                fetchUserProfile(session.user.id).then(setUser)
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                    emailRedirectTo: window.location.origin,
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
            return { error: null }
        } catch (error) {
            console.error('Catch signIn error:', error);
            return { error: error as Error }
        }
    }

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSupabaseUser(null)
        setSession(null)
    }

    // Refresh user profile
    const refreshUser = async () => {
        if (supabaseUser) {
            const profile = await fetchUserProfile(supabaseUser.id)
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
        signOut,
        refreshUser,
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
