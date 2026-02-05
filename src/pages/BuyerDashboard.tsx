
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Clock, MapPin, ChevronRight, Bookmark, Search, Shield } from 'lucide-react';
import { getSavedListings } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [savedCows, setSavedCows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user]);

  const fetchSavedListings = async () => {
    try {
      const { data, error } = await getSavedListings(user!.id);
      if (error) throw error;
      setSavedCows(data?.map((item: any) => item.listing) || []);
    } catch (err) {
      console.error('Error fetching saved listings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">My MooMarket</h1>
            <p className="text-slate-500">Welcome back, {user?.full_name || 'User'}. Viewing your saved cows.</p>
          </div>
          <Link to="/listings" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all gap-2">
            <Search size={20} /> Browse More
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark size={20} className="text-emerald-600" />
                  Saved Cow Listings
                </h3>
                <span className="text-xs font-bold text-slate-400">{savedCows.length} Items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p>Loading your favorites...</p>
                  </div>
                ) : savedCows.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <p className="mb-4">No saved listings yet.</p>
                    <Link to="/listings" className="text-emerald-600 font-bold hover:underline">Start Browsing</Link>
                  </div>
                ) : (
                  savedCows.map(cow => {
                    const photo = cow.media?.find((m: any) => m.media_type === 'photo')?.media_url ||
                      cow.photos?.[0] ||
                      '/placeholder-cow.jpg';
                    return (
                      <Link key={cow.id} to={`/listing/${cow.id}`} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors group">
                        <img src={photo} className="w-24 h-24 rounded-2xl object-cover" />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{cow.breed} • {cow.age}Y</h4>
                            <p className="font-bold text-slate-900">KSh {cow.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <MapPin size={12} />
                            <span className="text-xs">{cow.specific_location || cow.county}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Verified</span>
                            <span className="text-[10px] text-slate-400">Added 2 days ago</span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={20} className="text-blue-600" />
                  Active Inspections
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirmed Visit</p>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">JAN 24</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Friesian Heifer</h4>
                  <p className="text-xs text-slate-500 mb-3">Green Valleys Farm, Kiambu</p>
                  <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:shadow-sm">Contact Farmer</button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-2">Buyer Safety Guarantee</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never send money before visiting the farm. MooMarket verified badges help you find the most trustworthy farmers in Kenya.
                </p>
              </div>
              <Shield size={80} className="absolute -bottom-6 -right-6 text-slate-800" />
            </div>

            {/* Seller Promo */}
            {user?.role === 'buyer' && (
              <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest mb-4">New Opportunity</div>
                  <h4 className="text-xl font-bold mb-3 tracking-tight">Turn your cattle into cash</h4>
                  <p className="text-sm text-emerald-50 text-emerald-50/80 mb-6 leading-relaxed">
                    Join 500+ verified Kenyan dairy farmers selling directly to buyers on MooMarket.
                  </p>
                  <Link
                    to="/seller/onboarding"
                    className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Start Selling <ChevronRight size={18} />
                  </Link>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
