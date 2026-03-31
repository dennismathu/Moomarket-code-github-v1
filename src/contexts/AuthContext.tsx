import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '../types/types'

/** How long (ms) status messages are shown before auto-dismissing. */
const MESSAGE_DISMISS_MS = 3000

interface AuthContextType {
    user: User | null
    supabaseUser: SupabaseUser | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => Promise<{ error: Error | null }>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signInWithGoogle: () => Promise<{ error: Error | null }>
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
            setTimeout(() => setMessageState(null), MESSAGE_DISMISS_MS)
        }
    }

    // Fetch user profile from public.users table.
    // NOTE: Does NOT attempt a front-end INSERT fallback — that would bypass RLS
    // and create ghost users that cause FK constraint failures downstream.
    // If no profile row exists the user sees a clear error via the null return.
    const fetchUserProfile = async (userId: string) => {
        try {
            if (import.meta.env.DEV) console.log('Fetching profile for user:', userId);
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
                // The DB trigger failed to create the profile row.
                // Attempt a safe fallback INSERT using the auth user's metadata.
                console.warn(
                    'No profile row found in public.users for auth user:', userId,
                    '— attempting fallback INSERT from auth metadata.'
                );

                // Get the current session to read metadata
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) return null;

                const meta = authUser.user_metadata || {};
                const fallbackRole = (meta.role === 'seller' ? 'seller' : 'buyer') as 'buyer' | 'seller';
                const fallbackName = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'User';

                const { data: inserted, error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: authUser.email,
                        full_name: fallbackName,
                        role: fallbackRole,
                        is_phone_verified: false,
                        is_email_verified: !!authUser.email_confirmed_at,
                        is_id_verified: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error(
                        'Fallback INSERT into public.users failed:', insertError.message,
                        '— user profile cannot be loaded. Contact support.'
                    );
                    return null;
                }

                if (import.meta.env.DEV) console.log('Fallback profile created for:', userId);
                return inserted as User;
            }

            if (import.meta.env.DEV) console.log('Profile fetched successfully for:', userId);
            return data as User
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        // Get initial session — async so setLoading(false) only fires AFTER profile fetch
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!mounted) return;

            setSession(session);
            const currentSupabaseUser = session?.user ?? null;
            setSupabaseUser(currentSupabaseUser);

            if (currentSupabaseUser) {
                const profile = await fetchUserProfile(currentSupabaseUser.id);
                if (mounted) setUser(profile);
            }
            // setLoading only after the async profile fetch is fully resolved
            if (mounted) setLoading(false);
        };

        // Wrap with a 10-second safety timeout so `loading` never hangs forever.
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 10_000));
        Promise.race([initAuth(), timeout]).finally(() => {
            // Guard against updating state after the component unmounts (e.g. after sign-out navigation)
            if (mounted) setLoading(false);
        });

        // Listen for auth changes (sign-in, sign-out, token refresh, password recovery)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (import.meta.env.DEV) console.log('Auth state change event:', event);

            setSession(session);
            const currentSupabaseUser = session?.user ?? null;
            setSupabaseUser(currentSupabaseUser);

            if (!currentSupabaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // TOKEN_REFRESHED fires silently every ~1 hour and on tab focus.
            // Skip the DB round-trip when we already have the profile in state.
            if (event === 'TOKEN_REFRESHED' && user !== null) {
                return;
            }

            const profile = await fetchUserProfile(currentSupabaseUser.id);
            if (mounted) {
                setUser(profile);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sign up new user
    const signUp = async (email: string, password: string, fullName: string, role: 'buyer' | 'seller') => {
        try {
            if (import.meta.env.DEV) console.log('Attempting signUp as role:', role);
            const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signUp({
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
                console.error('signUp error:', error.message);
                throw error;
            }

            if (import.meta.env.DEV) console.log('signUp success');
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Sign in existing user
    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('signIn error:', error.message);
                throw error;
            }

            setMessage({ text: 'Login successful!', type: 'success' })
            return { error: null }
        } catch (error: any) {
            return { error: error as Error }
        }
    }

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${siteUrl}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) {
                console.error('Google signIn error:', error.message);
                throw error;
            }

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    // Reset password
    const resetPassword = async (email: string) => {
        try {
            const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${siteUrl}/reset-password`,
            })

            if (error) {
                // Don't log the email — surface error internally only
                console.error('resetPassword error:', error.message);
                throw error;
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Update password
    const updatePassword = async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('updatePassword error:', error.message);
                throw error;
            }

            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
    }

    // Sign out
    const signOut = async () => {
        // 1. Clear local state IMMEDIATELY for responsive UI
        setUser(null)
        setSupabaseUser(null)
        setSession(null)
        setLoading(false)
        setMessage({ text: 'Logged out successfully', type: 'info' })

        // 2. Clear Supabase session with safety timeout
        try {
            const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
            await Promise.race([supabase.auth.signOut(), timeout]);
        } catch (error) {
            console.warn('Sign out background task error or timeout:', error);
        }
    }

    // Update profile
    const updateProfile = async (updates: Partial<User>) => {
        try {
            if (!supabaseUser) throw new Error('No user logged in');

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', supabaseUser.id);

            if (error) {
                console.error('updateProfile error:', error.message);
                throw error;
            }

            await refreshUser();
            return { error: null }
        } catch (error) {
            return { error: error as Error }
        }
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
        signInWithGoogle,
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
