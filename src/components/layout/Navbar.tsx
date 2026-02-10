import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LayoutDashboard, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInspectionRequestsBySeller, getNotifications } from '../../lib/database';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);

            // Close dropdown on click outside
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (!target.closest('.notifications-container')) {
                    setIsNotificationsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                clearInterval(interval);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data, error } = await getNotifications(user.id);
            if (error) throw error;

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toDateString();

            const enhancedData = data?.map((n: any) => {
                const targetDate = new Date(n.preferred_date);
                const isTomorrow = targetDate.toDateString() === tomorrowStr;
                const isUpdated = new Date(n.updated_at).getTime() - new Date(n.created_at).getTime() > 2000;
                return { ...n, isTomorrow, isUpdated };
            });

            const unread = enhancedData?.filter((n: any) =>
                (n.listing.seller_id === user.id && n.status === 'pending') ||
                (n.buyer_id === user.id && n.status === 'confirmed') ||
                n.isTomorrow
            ).length || 0;

            setNotifications(enhancedData || []);
            setUnreadCount(unread);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">MooMarket<span className="text-emerald-600">.ke</span></span>
                        </Link>
                        <div className="hidden md:ml-8 md:flex md:space-x-8">
                            <Link to="/listings" className="text-slate-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">Browse</Link>
                            {(user?.role === 'seller' || user?.role === 'admin') && (
                                <Link to="/seller/new-listing" className="text-slate-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">Sell a Cow</Link>
                            )}

                            <a href="/#how-it-works" className="text-slate-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">How it Works</a>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="relative notifications-container">
                                    <button
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors relative"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>

                                    {/* Desktop Notifications Dropdown */}
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                                <h3 className="font-bold text-slate-900 text-sm italic">Notifications</h3>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-slate-400">
                                                        <p className="text-xs">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(n => {
                                                        const isSeller = n.listing.seller_id === user.id;
                                                        const isBuyer = n.buyer_id === user.id;

                                                        return (
                                                            <div
                                                                key={n.id}
                                                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${((isSeller && n.status === 'pending') || (isBuyer && n.status === 'confirmed')) ? 'bg-emerald-50/30' : ''
                                                                    }`}
                                                                onClick={() => {
                                                                    navigate(isSeller ? '/dashboard/seller#upcoming-inspections' : '/dashboard/buyer');
                                                                    setIsNotificationsOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.isTomorrow ? 'bg-indigo-100 text-indigo-600 animate-pulse' :
                                                                        n.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                                                                            n.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                                                                'bg-amber-100 text-amber-600'
                                                                        }`}>
                                                                        <Bell size={14} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-slate-900 leading-tight">
                                                                            {n.isTomorrow && (
                                                                                <span className="inline-block px-1.5 py-0.5 bg-indigo-600 text-[8px] text-white font-black uppercase rounded mr-1.5 align-middle">Reminder</span>
                                                                            )}
                                                                            {n.isUpdated && (
                                                                                <span className="inline-block px-1.5 py-0.5 bg-amber-500 text-[8px] text-white font-black uppercase rounded mr-1.5 align-middle">Rescheduled</span>
                                                                            )}
                                                                            {isSeller && n.status === 'pending' && (
                                                                                <>New inspection request for your <span className="font-bold">{n.listing.breed}</span></>
                                                                            )}
                                                                            {isBuyer && n.status === 'confirmed' && (
                                                                                <>Your inspection for <span className="font-bold">{n.listing.breed}</span> has been <span className="text-blue-600 font-bold">confirmed</span>!</>
                                                                            )}
                                                                            {isBuyer && n.status === 'pending' && (
                                                                                <>You requested an inspection for <span className="font-bold">{n.listing.breed}</span></>
                                                                            )}
                                                                            {n.status === 'completed' && (
                                                                                <>Inspection for <span className="font-bold">{n.listing.breed}</span> marked as <span className="text-emerald-600 font-bold">completed</span></>
                                                                            )}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                                                                {new Date(n.updated_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                                            </p>
                                                                            <p className={`text-[10px] font-bold ${n.isTomorrow ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                                                • {new Date(n.preferred_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                                <button
                                                    onClick={() => {
                                                        navigate(user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer');
                                                        setIsNotificationsOpen(false);
                                                    }}
                                                    className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest"
                                                >
                                                    View All Activity
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {user.role === 'admin' ? (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors border border-slate-900 shadow-sm"
                                        >
                                            <Shield size={18} />
                                            <span className="text-sm font-bold tracking-tight">Admin</span>
                                        </Link>
                                        <Link
                                            to="/dashboard/seller"
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
                                        >
                                            <LayoutDashboard size={18} />
                                            <span className="text-sm font-bold tracking-tight">My Dashboard</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        to={user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
                                    >
                                        <LayoutDashboard size={18} />
                                        <span className="text-sm font-bold tracking-tight">Dashboard</span>
                                    </Link>
                                )}
                                <div className="h-8 w-[1px] bg-slate-200"></div>
                                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                        {user.full_name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Sign out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-slate-600 hover:text-emerald-600 px-4 py-2 font-medium transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={toggleMobileMenu} className="text-slate-500 hover:text-slate-600 p-2">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-1 shadow-lg">
                    <Link to="/" className="block px-3 py-4 text-base font-medium text-slate-700 border-b border-slate-50" onClick={toggleMobileMenu}>Home</Link>
                    <Link to="/listings" className="block px-3 py-4 text-base font-medium text-slate-700 border-b border-slate-50" onClick={toggleMobileMenu}>Browse Marketplace</Link>
                    {(user?.role === 'seller' || user?.role === 'admin') && (
                        <Link to="/seller/new-listing" className="block px-3 py-4 text-base font-medium text-slate-700 border-b border-slate-50" onClick={toggleMobileMenu}>Sell a Cow</Link>
                    )}

                    {user ? (
                        <>
                            <Link to="/profile" className="block px-3 py-4 text-base font-medium text-slate-700 border-b border-slate-50" onClick={toggleMobileMenu}>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <UserIcon size={18} className="text-slate-400" />
                                    Your Profile
                                </div>
                            </Link>
                            {user.role === 'admin' ? (
                                <>
                                    <Link to="/admin" className="block px-3 py-4 text-base font-bold text-slate-900 border-b border-slate-50" onClick={toggleMobileMenu}>
                                        <div className="flex items-center gap-2">
                                            <Shield size={18} />
                                            Admin Control Panel
                                        </div>
                                    </Link>
                                    <Link to="/dashboard/seller" className="block px-3 py-4 text-base font-bold text-emerald-600" onClick={toggleMobileMenu}>
                                        <div className="flex items-center gap-2">
                                            <LayoutDashboard size={18} />
                                            My Seller Dashboard
                                        </div>
                                    </Link>
                                </>
                            ) : (
                                <Link to={user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'} className="block px-3 py-4 text-base font-bold text-emerald-600" onClick={toggleMobileMenu}>
                                    <div className="flex items-center gap-2">
                                        <LayoutDashboard size={18} />
                                        Go to My Dashboard
                                    </div>
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    handleSignOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-4 text-base font-medium text-red-600 border-t border-slate-100"
                            >
                                <div className="flex items-center gap-2">
                                    <LogOut size={18} />
                                    Sign Out
                                </div>
                            </button>
                            {unreadCount > 0 && (
                                <Link
                                    to={user.role === 'seller' ? '/dashboard/seller#upcoming-inspections' : '/dashboard/buyer'}
                                    className="block px-3 py-4 text-sm font-bold text-amber-600 bg-amber-50 rounded-xl mt-2"
                                    onClick={toggleMobileMenu}
                                >
                                    <div className="flex items-center gap-2">
                                        <Bell size={18} className="animate-bounce" />
                                        You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                                    </div>
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link to="/login" className="block px-3 py-4 text-base font-bold text-emerald-600 border-t border-slate-100" onClick={toggleMobileMenu}>
                            Log In / Sign Up
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

