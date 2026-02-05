import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, ChevronLeft, Save, MapPin, Phone, User as UserIcon, CheckCircle2, ArrowRight, LayoutDashboard, ShoppingBag } from 'lucide-react'

const COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River',
    'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
]

export default function ProfilePage() {
    const { user, updateProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        county: '',
        specific_location: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '+254',
                county: user.county || '',
                specific_location: user.specific_location || ''
            })
        }
    }, [user])

    const isDirty = user ? (
        formData.full_name !== (user.full_name || '') ||
        formData.phone_number !== (user.phone_number || '') ||
        formData.county !== (user.county || '') ||
        formData.specific_location !== (user.specific_location || '')
    ) : false;

    const hasProfile = user?.phone_number && user?.county;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setLoading(true)

        const { error } = await updateProfile({
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            county: formData.county,
            specific_location: formData.specific_location
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors mb-4">
                            <ChevronLeft size={20} /> Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
                        <p className="text-slate-500 mt-1">Manage your account information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center sticky top-24">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-3xl mx-auto mb-4">
                                {user.full_name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
                            <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                {user.role}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-left">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={18} className="text-slate-400" />
                                    <span className="text-sm">{user.county || 'Location not set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={18} className="text-slate-400" />
                                    <span className="text-sm">{user.phone_number || 'Phone not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-600" size={20} />
                                    <p className="text-sm text-emerald-600 font-medium">Profile updated successfully!</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                placeholder="e.g., 0712 345 678"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                County
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <select
                                                    value={formData.county}
                                                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                                                >
                                                    <option value="">Select County</option>
                                                    {COUNTIES.map(county => (
                                                        <option key={county} value={county}>{county}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                Specific Location
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.specific_location}
                                                onChange={(e) => setFormData({ ...formData, specific_location: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                placeholder="e.g., Town, Sub-county"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isDirty && !success && (
                                    <p className="text-xs text-amber-600 font-medium mb-4 animate-pulse flex items-center gap-1">
                                        You have unsaved changes
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || !isDirty}
                                        className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                                Saving...
                                            </>
                                        ) : success ? (
                                            <>
                                                <CheckCircle2 size={20} />
                                                Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                {hasProfile ? 'Update Profile' : 'Save Profile'}
                                            </>
                                        )}
                                    </button>

                                    {success && (
                                        <div className="contents animate-in fade-in slide-in-from-left-4 duration-500">
                                            <Link
                                                to="/listings"
                                                className="px-6 py-4 bg-white text-emerald-600 font-bold rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                                            >
                                                <ShoppingBag size={20} />
                                                Browse Marketplace
                                            </Link>
                                            <Link
                                                to={user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}
                                                className="px-6 py-4 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                            >
                                                <LayoutDashboard size={20} />
                                                Go to Dashboard
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
