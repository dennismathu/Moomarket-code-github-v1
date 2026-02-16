
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Clock, MapPin, ChevronRight, Bookmark, Search, Shield, CalendarCheck, Calendar } from 'lucide-react';
import { getSavedListings, getInspectionRequestsByBuyer, updateInspectionRequest } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [savedCows, setSavedCows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inspections, setInspections] = React.useState<any[]>([]);
  const [inspectionsLoading, setInspectionsLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      fetchSavedListings();
      fetchInspections();
    }
  }, [user]);

  const fetchInspections = async () => {
    if (!user) return;
    setInspectionsLoading(true);
    try {
      const { data, error } = await getInspectionRequestsByBuyer(user.id);
      if (error) throw error;
      setInspections(data || []);
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setInspectionsLoading(false);
    }
  };

  const handleConfirmNewDate = async (inspectionId: string) => {
    try {
      const { error } = await updateInspectionRequest(inspectionId, { rescheduled_by: null });
      if (error) throw error;
      setInspections(prev => prev.map(i => i.id === inspectionId ? { ...i, rescheduled_by: null } : i));
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (err) {
      console.error('Error confirming new date:', err);
      alert('Failed to confirm new date');
    }
  };

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

  // Compute upcoming inspections (pending or confirmed, not completed)
  const upcomingInspections = inspections
    .filter(i => i.status === 'pending' || i.status === 'confirmed')
    .sort((a, b) => new Date(a.preferred_date).getTime() - new Date(b.preferred_date).getTime());

  const getCountdownText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Overdue', color: 'bg-red-100 text-red-700 border-red-200' };
    if (diffDays === 0) return { text: 'Today', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    if (diffDays <= 7) return { text: `In ${diffDays} days`, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { text: `In ${diffDays} days`, color: 'bg-slate-100 text-slate-600 border-slate-200' };
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
            {/* Upcoming Visits Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Your Upcoming Viewings
                </h3>
                <span className="text-xs font-bold text-slate-400">{upcomingInspections.length} Scheduled</span>
              </div>
              {inspectionsLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading your viewings...</p>
                </div>
              ) : upcomingInspections.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Calendar size={24} className="text-slate-300" />
                  </div>
                  <p className="mb-2 font-medium">No upcoming visits scheduled</p>
                  <Link to="/listings" className="text-emerald-600 font-bold text-sm hover:underline">Browse cows & request viewings</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {upcomingInspections.map(inspection => {
                    const countdown = getCountdownText(inspection.preferred_date);
                    const isConfirmed = inspection.status === 'confirmed';
                    return (
                      <div
                        key={inspection.id}
                        className={`p-5 md:p-6 hover:bg-slate-50/50 transition-colors ${isConfirmed ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-400'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${isConfirmed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {inspection.status}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${countdown.color}`}>
                                {countdown.text}
                              </span>
                              {inspection.rescheduled_by === 'seller' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white border border-amber-600 animate-pulse">
                                  New Date
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">{inspection.listing?.breed || 'Unknown Breed'}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar size={12} className="text-blue-500" />
                                {new Date(inspection.preferred_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin size={12} className="text-emerald-500" />
                                {inspection.listing?.specific_location || inspection.listing?.county || 'Location N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {inspection.rescheduled_by === 'seller' ? (
                              <button
                                onClick={() => handleConfirmNewDate(inspection.id)}
                                className="px-4 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm flex items-center gap-1.5"
                              >
                                <CalendarCheck size={14} /> Confirm Date
                              </button>
                            ) : (
                              <Link
                                to={`/listing/${inspection.listing_id}`}
                                className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5"
                              >
                                View Listing <ChevronRight size={14} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
                  Active Viewings
                </h3>
              </div>
              {inspectionsLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Loading...</p>
                </div>
              ) : inspections.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-xs">No active viewing requests.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {inspections.map(inspection => (
                    <div key={inspection.id} className={`p-4 rounded-2xl border ${inspection.rescheduled_by === 'seller' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${inspection.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            inspection.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {inspection.status}
                          </span>
                          {inspection.rescheduled_by === 'seller' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-amber-500 text-white border border-amber-600 animate-pulse">
                              New Date Proposed
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold ${inspection.rescheduled_by === 'seller' ? 'text-amber-600' : 'text-slate-400'}`}>
                          {new Date(inspection.preferred_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-0.5 text-sm">{inspection.listing?.breed || 'Unknown Breed'}</h4>
                      <p className="text-[10px] text-slate-500 mb-3">{inspection.listing?.specific_location || inspection.listing?.county || 'Location Unavailable'}</p>
                      {inspection.rescheduled_by === 'seller' ? (
                        <button
                          onClick={() => handleConfirmNewDate(inspection.id)}
                          className="w-full py-2.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <CalendarCheck size={14} /> Confirm New Date
                        </button>
                      ) : (
                        <button className="w-full py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:shadow-sm transition-all">
                          {inspection.status === 'confirmed' ? 'Contact Farmer' : 'View Details'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
