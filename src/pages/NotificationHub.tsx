import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, MapPin, CheckCircle, Clock, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications } from '../lib/database';

const NotificationHub: React.FC = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'action' | 'updates'>('all');

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await getNotifications(user.id);
            if (error) throw error;

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toDateString();

            const enhanced = data?.map((n: any) => {
                const targetDate = new Date(n.preferred_date);
                const isTomorrow = targetDate.toDateString() === tomorrowStr;
                const isUpdated = new Date(n.updated_at).getTime() - new Date(n.created_at).getTime() > 2000;

                const isSeller = n.listing?.seller_id === user.id;
                const isBuyer = n.buyer_id === user.id;

                // Determine notification type and message
                let type: 'action' | 'updates' = 'updates';
                let title = '';
                let description = '';
                let icon: 'request' | 'confirmed' | 'completed' | 'rescheduled' | 'reminder' = 'request';

                if (isSeller && n.rescheduled_by === 'buyer') {
                    type = 'action';
                    title = 'Buyer Rescheduled Viewing';
                    description = `${n.buyer?.full_name || 'A buyer'} proposed a new date for ${n.listing?.breed}: ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
                    icon = 'rescheduled';
                } else if (isBuyer && n.rescheduled_by === 'seller') {
                    type = 'action';
                    title = 'Farmer Suggested New Date';
                    description = `The farmer proposed ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} for your ${n.listing?.breed} viewing. Go to your dashboard to confirm.`;
                    icon = 'rescheduled';
                } else if (isSeller && n.status === 'pending') {
                    type = 'action';
                    title = 'New Viewing Request';
                    description = `${n.buyer?.full_name || 'A buyer'} wants to view your ${n.listing?.breed} on ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
                    icon = 'request';
                } else if (isBuyer && n.status === 'confirmed') {
                    type = 'updates';
                    title = 'Viewing Confirmed!';
                    description = `Your visit to see ${n.listing?.breed} is confirmed for ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
                    icon = 'confirmed';
                } else if (isSeller && n.status === 'confirmed') {
                    type = 'updates';
                    title = 'Viewing Confirmed';
                    description = `${n.buyer?.full_name || 'The buyer'} has confirmed the viewing for ${n.listing?.breed} on ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
                    icon = 'confirmed';
                } else if (n.status === 'completed') {
                    type = 'updates';
                    title = 'Viewing Completed';
                    description = `Viewing for ${n.listing?.breed} has been marked as completed`;
                    icon = 'completed';
                } else if (isBuyer && n.status === 'pending') {
                    type = 'updates';
                    title = 'Request Sent';
                    description = `You requested to view ${n.listing?.breed} on ${new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}. Waiting for seller to confirm.`;
                    icon = 'request';
                }

                if (isTomorrow && n.status !== 'completed') {
                    icon = 'reminder';
                }

                return { ...n, isTomorrow, isUpdated, isSeller, isBuyer, type, title, description, icon };
            }) || [];

            setNotifications(enhanced);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredNotifications = filter === 'all' ? notifications
        : notifications.filter(n => n.type === filter);

    const getIconElement = (icon: string) => {
        switch (icon) {
            case 'reminder': return <Bell size={18} className="text-indigo-600" />;
            case 'rescheduled': return <RefreshCw size={18} className="text-amber-600" />;
            case 'confirmed': return <CheckCircle size={18} className="text-blue-600" />;
            case 'completed': return <CheckCircle size={18} className="text-emerald-600" />;
            default: return <Clock size={18} className="text-amber-500" />;
        }
    };

    const getIconBg = (icon: string) => {
        switch (icon) {
            case 'reminder': return 'bg-indigo-50 border-indigo-100';
            case 'rescheduled': return 'bg-amber-50 border-amber-100';
            case 'confirmed': return 'bg-blue-50 border-blue-100';
            case 'completed': return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-amber-50 border-amber-100';
        }
    };

    const getTimeSince = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Notifications</h1>
                        <p className="text-slate-500 text-sm">{notifications.length} total notifications</p>
                    </div>
                    <button
                        onClick={fetchNotifications}
                        className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'action', 'updates'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${filter === tab
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {tab === 'action' ? 'Action Required' : tab === 'updates' ? 'Updates' : 'All'}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p>Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Bell size={24} className="text-slate-300" />
                            </div>
                            <p className="font-medium mb-1">No notifications</p>
                            <p className="text-xs">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredNotifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-5 md:p-6 hover:bg-slate-50/50 transition-colors ${n.type === 'action' ? 'border-l-4 border-l-amber-400' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getIconBg(n.icon)}`}>
                                            {getIconElement(n.icon)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                                                    {n.isTomorrow && n.status !== 'completed' && (
                                                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-widest rounded border border-indigo-200">
                                                            Tomorrow
                                                        </span>
                                                    )}
                                                    {n.isUpdated && !n.rescheduled_by && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest rounded border border-amber-200">
                                                            Updated
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                    {getTimeSince(n.updated_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed mb-3">{n.description}</p>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                    <Calendar size={10} />
                                                    {new Date(n.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                {n.listing?.county && (
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                        <MapPin size={10} />
                                                        {n.listing.county}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <Link
                                                        to={`/listing/${n.listing_id}`}
                                                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                                                    >
                                                        View Cow <ChevronRight size={12} />
                                                    </Link>
                                                    {n.type === 'action' && (
                                                        <Link
                                                            to={user.role === 'seller' ? `/dashboard/seller${n.isSeller ? '#upcoming-inspections' : '#your-visits'}` : '/dashboard/buyer'}
                                                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                        >
                                                            Take Action <ChevronRight size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationHub;
