import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Lock } from 'lucide-react'
import GoogleIcon from '../components/icons/GoogleIcon'

// Map raw Supabase error messages to user-friendly strings
const friendlyError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.'
    if (msg.includes('Email not confirmed')) return 'Please verify your email address before signing in.'
    if (msg.includes('too many requests') || msg.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.'
    if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Check your connection and try again.'
    return msg
}

export default function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/listings'
    const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    // Brute-force guard: lock form for 30s after 5 failed attempts
    const [failCount, setFailCount] = useState(0)
    const [lockoutSeconds, setLockoutSeconds] = useState(0)
    const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        // If user is already present (e.g. from a previous session or back-channel login), redirect immediately
        if (user && !authLoading) {
            navigate(redirectTo, { replace: true });
        }
        return () => { if (lockoutTimer.current) clearInterval(lockoutTimer.current) }
    }, [user, authLoading, navigate, redirectTo])

    const startLockout = () => {
        let secs = 30
        setLockoutSeconds(secs)
        lockoutTimer.current = setInterval(() => {
            secs -= 1
            setLockoutSeconds(secs)
            if (secs <= 0) {
                clearInterval(lockoutTimer.current!)
                lockoutTimer.current = null
                setLockoutSeconds(0)
                setFailCount(0)
            }
        }, 1000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (lockoutSeconds > 0) return
        setError('')
        setLoading(true)

        try {
            const { error } = await signIn(email.trim(), password)
            if (error) {
                const newFail = failCount + 1
                setFailCount(newFail)
                setError(friendlyError(error.message))
                if (newFail >= 5) startLockout()
            } else {
                navigate(redirectTo, { replace: true })
            }
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div data-testid="auth-spinner" className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                    <h1 className="text-3xl font-extrabold text-slate-900 mt-6">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to your account</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    {lockoutSeconds > 0 && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                            <Lock size={18} className="text-orange-500 shrink-0" />
                            <p className="text-sm text-orange-700 font-medium">
                                Too many failed attempts. Try again in <span className="font-bold">{lockoutSeconds}s</span>.
                            </p>
                        </div>
                    )}
                    {error && !lockoutSeconds && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            const { error } = await signInWithGoogle();
                            if (error) {
                                setError(error.message);
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 mb-6"
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or sign in with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || lockoutSeconds > 0}
                            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s)` : 'Sign In'}
                        </button>
                    </form>


                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
