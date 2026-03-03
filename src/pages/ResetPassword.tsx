import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, ChevronLeft, ShieldX } from 'lucide-react'

export default function ResetPassword() {
    const navigate = useNavigate()
    const { updatePassword } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    // null = still waiting, true = valid recovery link, false = invalid/expired
    const [isRecoverySession, setIsRecoverySession] = useState<boolean | null>(null)

    // Detect whether the user arrived via a genuine password-reset email link.
    //
    // Why getSession() is the primary check:
    //   Supabase processes the reset token (URL hash or PKCE code) during its
    //   own initialization — BEFORE any React component mounts. By the time
    //   useEffect runs, the PASSWORD_RECOVERY event has already fired and will
    //   NOT be re-emitted for new subscribers. Calling getSession() immediately
    //   gives us the session that was created from the recovery token.
    //
    // The onAuthStateChange listener is kept as a backup for PKCE flows where
    // the token exchange is async and may finish after component mount.
    useEffect(() => {
        let isMounted = true

        // PRIMARY: check if Supabase already established a recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return
            if (session?.user) {
                // A valid session exists — the recovery link was processed successfully
                setIsRecoverySession(true)
            }
        })

        // BACKUP: catch PASSWORD_RECOVERY if PKCE exchange finishes after mount
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
                setIsRecoverySession(true)
            }
        })

        // After 8 seconds with no session and no event → mark link as invalid
        const timeout = setTimeout(() => {
            if (isMounted) setIsRecoverySession(prev => prev === null ? false : prev)
        }, 8000)

        return () => {
            isMounted = false
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters')
        }

        setLoading(true)

        const { error } = await updatePassword(password)

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // User is already authenticated at this point (recovery creates a session).
            // Redirect to listings — NOT /login — after 3 seconds.
            setTimeout(() => {
                navigate('/listings')
            }, 3000)
        }
    }

    // Show a waiting spinner while we check for the PASSWORD_RECOVERY event
    if (isRecoverySession === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Verifying your reset link…</p>
                </div>
            </div>
        )
    }

    // Show an error screen for direct navigation or expired links
    if (isRecoverySession === false) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldX className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Invalid or Expired</h2>
                    <p className="text-slate-500 mb-6">
                        This password reset link has expired or was already used. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                        Request a New Link
                    </Link>
                    <div className="mt-4">
                        <Link to="/login" className="text-sm text-slate-500 hover:text-emerald-600 font-medium flex items-center justify-center gap-1">
                            <ChevronLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">M</div>
                        <span className="text-2xl font-bold text-slate-900">MooMarket<span className="text-emerald-600">.ke</span></span>
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 mt-6">Set New Password</h1>
                    <p className="text-slate-500 mt-2">Enter your new password below</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    {success ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h2>
                            <p className="text-slate-500 mb-4">
                                Your account password has been successfully updated.
                            </p>
                            <p className="text-sm text-slate-400">Redirecting to the marketplace…</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-12"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-12"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating password...' : 'Update Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
