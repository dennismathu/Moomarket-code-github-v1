import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications } from '../lib/database';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Notification {
    id: string;
    listing_id: string;
    buyer_id: string;
    status: string;
    preferred_date: string;
    rescheduled_by: string | null;
    updated_at: string;
    created_at: string;
    type?: string;
    admin_notes?: string;
    listing: {
        breed: string;
        seller_id: string;
    };
    isTomorrow?: boolean;
    isUpdated?: boolean;
}

interface NotificationContextValue {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    refreshNotifications: () => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    refreshNotifications: async () => {},
});

// ─── Provider ───────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, supabaseUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Track whether this provider instance is still mounted.
    // Guards against setting state after unmount (and silently discards
    // AbortErrors caused by React Strict Mode's double-mount in dev).
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await getNotifications(user.id);

            // Component unmounted while request was in-flight — discard silently.
            if (!mountedRef.current) return;

            if (error) throw error;

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toDateString();

            const enriched = (data || []).map((n: any) => {
                const targetDate = new Date(n.preferred_date);
                const isTomorrow = targetDate.toDateString() === tomorrowStr;
                const isUpdated =
                    new Date(n.updated_at).getTime() - new Date(n.created_at).getTime() > 2000;
                return { ...n, isTomorrow, isUpdated };
            });

            const unread = enriched.filter((n: Notification) =>
                (n.listing.seller_id === user.id && n.status === 'pending') ||
                (n.buyer_id === user.id && n.status === 'confirmed') ||
                (n.listing.seller_id === user.id && n.rescheduled_by === 'buyer') ||
                (n.buyer_id === user.id && n.rescheduled_by === 'seller') ||
                n.type === 'listing_status' ||
                n.isTomorrow
            ).length;

            setNotifications(enriched);
            setUnreadCount(unread);
        } catch (err: any) {
            // AbortError is a React Strict Mode / unmount lifecycle artifact — not a real error.
            // Supabase aborts in-flight requests when the client connection is torn down.
            if (err?.message?.includes('AbortError') || err?.name === 'AbortError') return;
            if (mountedRef.current) {
                console.error('Error fetching notifications:', err);
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [user]);

    // Start/stop polling when the user logs in or out
    useEffect(() => {
        if (supabaseUser && user) {
            fetchNotifications();

            intervalRef.current = setInterval(fetchNotifications, 10000);
        } else {
            // Clear state when logged out
            setNotifications([]);
            setUnreadCount(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user, supabaseUser, fetchNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                refreshNotifications: fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useNotifications = () => useContext(NotificationContext);
