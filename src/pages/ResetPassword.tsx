import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ResetPassword() {
    const navigate = useNavigate()
    const { updatePassword } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

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
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        }
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
                            <p className="text-sm text-slate-400">Redirecting to login...</p>
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
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
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
