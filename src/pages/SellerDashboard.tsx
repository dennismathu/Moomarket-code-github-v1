
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
   ShoppingBag, MessageSquare, Calendar, ChevronRight, CheckCircle,
   Clock, Plus, ShieldCheck, Eye, TrendingUp, Award, Settings,
   BarChart3, CheckCircle2, MessageSquareText, Star, Edit3,
   Trash2, BellRing, Info, X, Droplets, Baby, Loader2
} from 'lucide-react';
import { getSellerListings, deleteListing as deleteListingFromDb } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { User, CowListing } from '../types/types';

interface DashboardProps {
   user: User | null;
}

const SellerDashboard: React.FC = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [sellerListings, setSellerListings] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [selectedCowForManagement, setSelectedCowForManagement] = useState<any | null>(null);
   const [selectedCowForSold, setSelectedCowForSold] = useState<any | null>(null);
   const [soldFeedback, setSoldFeedback] = useState('');
   const [buyerRating, setBuyerRating] = useState(0);
   const [nudgeBuyer, setNudgeBuyer] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const trustTips = [
      "Complete your profile to increase buyer trust by 40%.",
      "Verified sellers sell their cows 2x faster than unverified ones.",
      "Clear, high-quality photos can double your listing's view count.",
      "Providing a detailed health history encourages faster buyer decisions.",
      "Accurate milk yield data is the #1 factor for serious buyers."
   ];
   const [tipIndex, setTipIndex] = useState(0);

   useEffect(() => {
      const interval = setInterval(() => {
         setTipIndex(prev => (prev + 1) % trustTips.length);
      }, 10000); // Rotate tip every 10 seconds
      return () => clearInterval(interval);
   }, []);

   const calculateProfileStrength = () => {
      if (!user) return 0;
      let score = 0;
      const weights = {
         fullName: 10,
         phoneNumber: 20,
         county: 20,
         specificLocation: 10,
         idVerified: 40
      };

      if (user.full_name) score += weights.fullName;
      if (user.phone_number) score += weights.phoneNumber;
      if (user.county) score += weights.county;
      if (user.specific_location) score += weights.specificLocation;
      if (user.is_id_verified) score += weights.idVerified;

      return score;
   };

   const profileStrength = calculateProfileStrength();

   useEffect(() => {
      if (user) {
         fetchSellerListings();
      }
   }, [user]);

   const fetchSellerListings = async () => {
      if (!user) return;
      setLoading(true);
      try {
         const { data, error } = await getSellerListings(user.id);
         if (error) throw error;
         setSellerListings(data || []);
      } catch (err) {
         console.error('Error fetching seller listings:', err);
         setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
         setLoading(false);
      }
   };

   const handleEdit = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/seller/new-listing?edit=${id}`);
   };

   const handleDelete = async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

      setIsDeleting(true);
      try {
         const { error } = await deleteListingFromDb(id);
         if (error) throw error;

         setSellerListings(prev => prev.filter(c => c.id !== id));
         setSelectedCowForManagement(null);
      } catch (err) {
         console.error('Error deleting listing:', err);
         alert('Failed to delete listing. Please try again.');
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <div className="bg-slate-50 min-h-screen py-10 relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded tracking-wider">Active Seller Session</span>
                     <span className="text-slate-300">•</span>
                     <span className="text-xs text-slate-500 font-medium italic">Verified Dairy Partner</span>
                  </div>
                  <h1 className="text-4xl font-extrabold text-slate-900 font-serif">Farmer Dashboard</h1>
                  <p className="text-slate-500 mt-1">Manage your livestock, track performance, and respond to buyers.</p>
               </div>
               <div className="flex items-center gap-3">
                  <Link to="/seller/new-listing" className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all gap-2">
                     <Plus size={20} /> List New Cow
                  </Link>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-emerald-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Listings</p>
                     <ShoppingBag size={16} className="text-slate-300 group-hover:text-emerald-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{sellerListings.filter(c => c.status !== 'sold' && c.status !== 'draft').length}</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Views</p>
                     <Eye size={16} className="text-slate-300 group-hover:text-blue-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">1,248</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                     <TrendingUp size={12} /> +12% this week
                  </p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-amber-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inspections</p>
                     <Calendar size={16} className="text-slate-300 group-hover:text-amber-500" />
                  </div>
                  <p className="text-3xl font-black text-emerald-600">4</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-emerald-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buyer Inquiries</p>
                     <MessageSquare size={16} className="text-slate-300 group-hover:text-emerald-600" />
                  </div>
                  <p className="text-3xl font-black text-blue-600">12</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Feed */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                           <Award size={20} className="text-emerald-600" />
                           Your Active Cattle
                        </h3>
                        <Link to="/listings" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Browse Marketplace</Link>
                     </div>
                     <div className="divide-y divide-slate-100">
                        {loading ? (
                           <div className="p-12 text-center">
                              <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-4" />
                              <p className="text-slate-500 font-medium font-serif">Updating your livestock feed...</p>
                           </div>
                        ) : sellerListings.length > 0 ? (
                           sellerListings.map(cow => {
                              // Correctly map media from Supabase array
                              const photo = cow.media?.find((m: any) => m.media_type === 'photo')?.media_url || '/placeholder-cow.jpg';

                              // Peak yield calculation
                              const yields = [
                                 cow.milk_yield_day_1 || 0,
                                 cow.milk_yield_day_2 || 0,
                                 cow.milk_yield_day_3 || 0,
                                 cow.milk_yield_day_4 || 0,
                                 cow.milk_yield_day_5 || 0,
                                 cow.milk_yield_day_6 || 0,
                                 cow.milk_yield_day_7 || 0,
                              ];
                              const peakYield = Math.max(...yields);

                              return (
                                 <div
                                    key={cow.id}
                                    onClick={() => setSelectedCowForManagement(cow)}
                                    className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:bg-slate-50 transition-colors cursor-pointer relative"
                                 >
                                    <div className="flex w-full sm:w-auto items-center gap-4">
                                       <div className="relative shrink-0">
                                          <img src={photo} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover" />
                                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-100">
                                             <div className={`w-3 h-3 rounded-full ${cow.status === 'approved' ? 'bg-emerald-500' :
                                                cow.status === 'sold' ? 'bg-slate-400' :
                                                   cow.status === 'draft' ? 'bg-slate-300' :
                                                      'bg-amber-500'
                                                }`}></div>
                                          </div>
                                       </div>
                                       <div className="sm:hidden flex-grow">
                                          <h4 className="font-bold text-slate-900 tracking-tight text-base font-serif">{cow.breed} • {cow.age}Y</h4>
                                          <p className="text-sm font-bold text-slate-900">KSh {cow.price?.toLocaleString() || '0'}</p>
                                       </div>
                                    </div>

                                    <div className="flex-grow w-full sm:w-auto">
                                       <div className="hidden sm:flex justify-between items-start mb-1">
                                          <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight text-lg font-serif">{cow.breed} • {cow.age}Y</h4>
                                          <p className="text-sm font-bold text-slate-900">KSh {cow.price?.toLocaleString() || '0'}</p>
                                       </div>
                                       <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-0">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${cow.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                             cow.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                cow.status === 'sold' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                   cow.status === 'draft' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                                                      'bg-slate-50 text-slate-500 border-slate-100'
                                             }`}>
                                             {cow.status}
                                          </span>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Peak: {peakYield}L</div>
                                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                             <Eye size={12} /> {cow.view_count || 0} views
                                          </div>
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-3 absolute top-4 right-4 sm:static">
                                       <button
                                          onClick={(e) => handleEdit(cow.id, e)}
                                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                          title="Edit Listing"
                                       >
                                          <Edit3 size={18} />
                                       </button>
                                       <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 hidden sm:block" />
                                    </div>
                                 </div>
                              );
                           })
                        ) : (
                           <div className="p-12 text-center">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                 <ShoppingBag size={24} className="text-slate-300" />
                              </div>
                              <p className="text-slate-500 font-medium">You haven't listed any cattle yet.</p>
                              <Link to="/seller/new-listing" className="text-emerald-600 font-bold text-sm hover:underline mt-2 inline-block">Start Selling Now</Link>
                           </div>
                        )}
                     </div>
                     <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">Load History</button>
                     </div>
                  </div>


                  {/* Analytics Summary */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BarChart3 size={20} /></div>
                           <h3 className="font-bold text-slate-900">Market Insights</h3>
                        </div>
                        <Settings size={18} className="text-slate-300 cursor-pointer" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Demand Rank</p>
                           <p className="text-xl font-bold text-slate-800">Top 15% in Kiambu</p>
                           <p className="text-xs text-slate-500 mt-1">Based on search frequency</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price Benchmark</p>
                           <p className="text-xl font-bold text-slate-800">KSh 210k - 260k</p>
                           <p className="text-xs text-slate-500 mt-1">Average for Friesian Parity 2</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Sidebar */}
               <div className="space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Profile Strength</h3>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${profileStrength >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {profileStrength >= 80 ? 'Strong' : 'Improve'}
                        </div>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Progress</span>
                           <span className={`${profileStrength >= 80 ? 'text-emerald-600' : 'text-amber-600'} font-black`}>{profileStrength}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div
                              className={`h-full transition-all duration-1000 ${profileStrength >= 80 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                              style={{ width: `${profileStrength}%` }}
                           ></div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                           <div className="flex items-start gap-3">
                              <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Trust Tip</p>
                                 <p className="text-xs font-medium text-slate-600 leading-relaxed italic animate-in fade-in duration-700">
                                    "{trustTips[tipIndex]}"
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="pt-2 space-y-3">
                           <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                              {user?.is_phone_verified && user?.is_id_verified ? (
                                 <CheckCircle size={14} className="text-emerald-600" />
                              ) : (
                                 <X size={14} className="text-slate-300" />
                              )}
                              Phone & ID Verified
                           </div>
                           <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                              {user?.county ? (
                                 <CheckCircle size={14} className="text-emerald-600" />
                              ) : (
                                 <X size={14} className="text-slate-300" />
                              )}
                              Farm Location Linked
                           </div>
                           {!user?.is_id_verified && (
                              <Link to="/seller/onboarding" className="flex items-center gap-3 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                 <Plus size={14} /> Verify Your Identity
                              </Link>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                     <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-4">Need help selling?</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                           Our agents can visit your farm to capture professional videos and verify your herd details.
                        </p>
                        <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                           Request Visit
                        </button>
                     </div>
                     <div className="absolute -bottom-4 -right-4 opacity-10">
                        <ShieldCheck size={120} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Seller Management Modal (Detailed View) */}
         {selectedCowForManagement && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
               <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 shrink-0">
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg border border-slate-200">
                           ID: {selectedCowForManagement.id}
                        </span>
                        <h3 className="font-bold text-slate-900">Manage Listing</h3>
                     </div>
                     <button onClick={() => setSelectedCowForManagement(null)} className="p-2 text-slate-400 hover:text-slate-600">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
                     <div className="space-y-6">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
                           <img
                              src={selectedCowForManagement.media?.find((m: any) => m.media_type === 'photo')?.media_url || '/placeholder-cow.jpg'}
                              className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="text-center flex-1 border-r border-slate-200">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Views</p>
                              <p className="text-xl font-black text-slate-900">{selectedCowForManagement.view_count || 0}</p>
                           </div>
                           <div className="text-center flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Inquiries</p>
                              <p className="text-xl font-black text-blue-600">{selectedCowForManagement.inquiry_count || 0}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div>
                           <h4 className="text-2xl font-black text-slate-900 font-serif mb-1">{selectedCowForManagement.breed}</h4>
                           <p className="text-sm text-slate-500 flex items-center gap-1 font-medium italic"><Clock size={14} /> Listed {new Date(selectedCowForManagement.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Current Price</p>
                              <p className="text-sm font-black text-slate-900">KSh {selectedCowForManagement.price?.toLocaleString() || '0'}</p>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                              <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">{selectedCowForManagement.status}</p>
                           </div>
                        </div>

                        <div className="space-y-3 pt-2">
                           <button
                              onClick={(e) => handleEdit(selectedCowForManagement.id, e)}
                              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                           >
                              <Edit3 size={18} /> Edit Details
                           </button>
                           {selectedCowForManagement.status !== 'sold' && (
                              <button
                                 onClick={() => setSelectedCowForSold(selectedCowForManagement)}
                                 className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                              >
                                 <CheckCircle2 size={18} /> Mark as Sold
                              </button>
                           )}
                           <button className="w-full py-3 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 flex items-center justify-center gap-2">
                              <Trash2 size={14} /> Delete Listing
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Mark as Sold Modal */}
         {selectedCowForSold && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200">
               <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                  <div className="bg-emerald-600 p-6 md:p-8 text-white text-center shrink-0">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <CheckCircle2 size={32} />
                     </div>
                     <h3 className="text-2xl font-black font-serif">Sale Confirmation</h3>
                     <p className="text-emerald-100">Closing deal for {selectedCowForSold.breed}</p>
                  </div>

                  <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                        <Info className="text-amber-600 shrink-0 mt-1" size={20} />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                           Confirming the sale will move this listing to "Sold" status. This action cannot be undone once confirmed.
                        </p>
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Rate the Transaction</label>
                        <div className="flex gap-2 mb-4">
                           {[1, 2, 3, 4, 5].map(star => (
                              <button
                                 key={star}
                                 onClick={() => setBuyerRating(star)}
                                 className={`p-1 transition-all ${star <= buyerRating ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                              >
                                 <Star size={24} fill={star <= buyerRating ? "currentColor" : "none"} />
                              </button>
                           ))}
                        </div>
                        <textarea
                           placeholder="How was the experience with the buyer? (Optional)"
                           className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm min-h-[80px]"
                           value={soldFeedback}
                           onChange={(e) => setSoldFeedback(e.target.value)}
                        />
                     </div>

                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                           <div className="relative flex items-center">
                              <input
                                 type="checkbox"
                                 className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-emerald-600 checked:bg-emerald-600 transition-all"
                                 checked={nudgeBuyer}
                                 onChange={(e) => setNudgeBuyer(e.target.checked)}
                              />
                              <BellRing className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 left-1 pointer-events-none" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-slate-700">Nudge buyer for a review</p>
                              <p className="text-[10px] text-slate-500">We'll send a friendly SMS request for feedback.</p>
                           </div>
                        </label>
                     </div>

                     <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                        <button
                           onClick={() => setSelectedCowForSold(null)}
                           className="w-full sm:flex-1 py-4 text-slate-500 font-bold rounded-xl text-sm border border-transparent hover:bg-slate-50 transition-colors"
                        >
                           Go Back
                        </button>
                        <button
                           onClick={handleMarkAsSold}
                           className="w-full sm:flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 text-sm hover:bg-emerald-700 transition-all"
                        >
                           Yes, Mark as Sold
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SellerDashboard;
