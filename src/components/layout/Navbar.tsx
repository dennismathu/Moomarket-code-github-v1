import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    console.log('Navbar user state:', user);
    console.log('User role:', user?.role);

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
                            {user?.role === 'seller' && (
                                <Link to="/seller/new-listing" className="text-slate-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">Sell a Cow</Link>
                            )}
                            <a href="/#how-it-works" className="text-slate-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">How it Works</a>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                                    <Bell size={20} />
                                </button>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="text-sm font-bold tracking-tight">Dashboard</span>
                                </Link>
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
                    {user?.role === 'seller' && (
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
                            <Link to={user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'} className="block px-3 py-4 text-base font-bold text-emerald-600" onClick={toggleMobileMenu}>
                                <div className="flex items-center gap-2">
                                    <LayoutDashboard size={18} />
                                    Go to My Dashboard
                                </div>
                            </Link>
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

