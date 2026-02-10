import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, Calendar, MapPin, ShieldCheck, Heart, Share2, ArrowLeft, MessageSquare, CalendarDays, Check, Info, AlertTriangle, Truck, Play, X, Baby, Smartphone, Droplets, Phone, Lock, Zap, Loader2, Video, LayoutDashboard } from 'lucide-react';
import { getListingById, saveListing, unsaveListing, createInspectionRequest, getExistingInspectionRequest, updateInspectionRequest } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [requestingInspection, setRequestingInspection] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any | null>(null);

  useEffect(() => {
    fetchListing();
    if (user && id) {
      checkIfSaved();
      checkIfRequested();
    }
  }, [id, user]);

  const checkIfRequested = async () => {
    try {
      const { data } = await getExistingInspectionRequest(user!.id, id!);
      if (data) {
        setExistingRequest(data);
        setInspectionDate(data.preferred_date);
      }
    } catch (err) {
      console.error('Error checking inspection status:', err);
    }
  };

  const checkIfSaved = async () => {
    try {
      const { data } = await supabase
        .from('saved_listings')
        .select('*')
        .eq('user_id', user!.id)
        .eq('listing_id', id!)
        .maybeSingle();

      setIsSaved(!!data);
    } catch (err) {
      console.error('Error checking save status:', err);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please login to save listings");
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        const { error } = await unsaveListing(user.id, id!);
        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await saveListing(user.id, id!);
        if (error) throw error;
        setIsSaved(true);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update favorites");
    } finally {
      setIsSaving(false);
    }
  };
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showDeliveryTooltip, setShowDeliveryTooltip] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActivePhoto((prev) => (prev + 1) % (cowPhotos.length || 1));
    }
    if (isRightSwipe) {
      setActivePhoto((prev) => (prev - 1 + (cowPhotos.length || 1)) % (cowPhotos.length || 1));
    }
  };

  const fetchListing = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await getListingById(id);
      if (error) throw error;
      setListing(data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInspection = async () => {
    if (!user) {
      alert("Please login to request an inspection");
      return;
    }
    if (!inspectionDate) {
      alert("Please select a date");
      return;
    }

    setRequestingInspection(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(inspectionDate);
      if (selected < today) {
        alert("Please select a current or future date.");
        return;
      }

      if (existingRequest) {
        const { error } = await updateInspectionRequest(existingRequest.id, {
          preferred_date: inspectionDate
        });
        if (error) throw error;
        alert("Inspection date updated successfully!");
        setExistingRequest({ ...existingRequest, preferred_date: inspectionDate });
      } else {
        const { error } = await createInspectionRequest({
          listing_id: id!,
          buyer_id: user.id,
          preferred_date: inspectionDate,
          status: 'pending'
        });
        if (error) throw error;
        alert("Inspection request sent successfully!");
        // Refresh check
        checkIfRequested();
      }
      setShowInspectionModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to process inspection request");
    } finally {
      setRequestingInspection(false);
    }
  };

  const cow = listing;
  const seller = cow?.seller;
  const sellerProfile = seller?.seller_profile;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error || !cow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Listing</h2>
          <p className="text-slate-500 mb-8">{error || "This listing could not be found."}</p>
          <Link to="/listings" className="inline-flex items-center text-emerald-600 font-bold hover:gap-2 transition-all">
            <ArrowLeft size={20} className="mr-2" /> Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Map media and production data
  const cowPhotos = cow.media?.filter((m: any) => m.media_type === 'photo').map((m: any) => m.media_url) || ['/placeholder-cow.jpg'];
  const cowVideo = cow.media?.find((m: any) => m.media_type.startsWith('video'))?.media_url;
  const vetReport = cow.vet?.[0] || cow.vet; // Could be object or array depending on Supabase version/config

  const yields = [
    cow.milk_yield_day_1 || 0,
    cow.milk_yield_day_2 || 0,
    cow.milk_yield_day_3 || 0,
    cow.milk_yield_day_4 || 0,
    cow.milk_yield_day_5 || 0,
    cow.milk_yield_day_6 || 0,
    cow.milk_yield_day_7 || 0,
  ];
  const avgYieldVal = (yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(1);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/listings" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Trust Badges Banner */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vetReport?.is_verified && vetReport?.report_url ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0"><BadgeCheck size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-tighter">Vet Verified</p>
                    <p className="text-[10px] text-emerald-700 leading-tight">Authentic health report uploaded from a registered clinic.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                  <div className="w-10 h-10 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0"><BadgeCheck size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">No Vet Report</p>
                    <p className="text-[10px] text-slate-400 leading-tight">Seller hasn't uploaded a vet-signed document yet.</p>
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${seller?.is_phone_verified ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${seller?.is_phone_verified ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}><Smartphone size={20} /></div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-tighter ${seller?.is_phone_verified ? 'text-blue-900' : 'text-slate-500'}`}>Phone Verified</p>
                  <p className={`text-[10px] leading-tight ${seller?.is_phone_verified ? 'text-blue-700' : 'text-slate-400'}`}>{seller?.is_phone_verified ? "Seller's contact has been authenticated via SMS/OTP." : "Contact verification is still in progress."}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${seller?.is_id_verified ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${seller?.is_id_verified ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}><ShieldCheck size={20} /></div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-tighter ${seller?.is_id_verified ? 'text-indigo-900' : 'text-slate-500'}`}>ID Verified</p>
                  <p className={`text-[10px] leading-tight ${seller?.is_id_verified ? 'text-indigo-700' : 'text-slate-400'}`}>{seller?.is_id_verified ? "Seller's National ID has been reviewed by MooMarket." : "Identity verification is not yet completed."}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              <div
                className="relative aspect-[4/3] bg-slate-100 touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img src={cowPhotos[activePhoto]} alt={cow.breed} className="w-full h-full object-cover transition-opacity duration-500" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {cowPhotos.map((_, idx) => (
                    <button key={idx} onClick={() => setActivePhoto(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${activePhoto === idx ? 'bg-white w-6' : 'bg-white/40'}`} />
                  ))}
                </div>
              </div>
              <div className="p-4 flex gap-4 overflow-x-auto">
                {cowPhotos.map((photo, idx) => (
                  <button key={idx} onClick={() => setActivePhoto(idx)} className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === idx ? 'border-emerald-500 shadow-lg' : 'border-transparent opacity-60'}`}>
                    <img src={photo} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group cursor-pointer">
              {cowVideo ? (
                <>
                  <video src={cowVideo} className="w-full h-64 md:h-96 object-cover opacity-60" poster={cowPhotos[0]} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                      <Play size={40} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                    <div><h4 className="font-bold text-lg">Verified Video Proof</h4><p className="text-sm text-slate-300">Walking and milking clip included</p></div>
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/20">Video</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 md:h-96 text-slate-500">
                  <Video size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">No verified video proof yet</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 font-serif">Production & Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Last 7 Days Yield (Liters)</h4>
                  <div className="relative h-48 flex flex-col justify-between">
                    {[25, 20, 15, 10, 5, 0].map((level) => (
                      <div key={level} className="flex items-center gap-2 w-full text-[10px] text-slate-400">
                        <span className="w-4 text-right">{level}L</span>
                        <div className="flex-grow border-t border-slate-100 border-dashed"></div>
                      </div>
                    ))}
                    <div className="absolute inset-0 left-6 right-0 flex items-end gap-2 pb-[1px]">
                      {yields.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <div className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-lg transition-all relative overflow-hidden" style={{ height: `${(val / 25) * 100}%` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent"></div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold z-10">{val}L</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pl-6 mt-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (<span key={day} className="text-[10px] font-bold text-slate-400 flex-1 text-center">{day}</span>))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <Baby size={20} className="mx-auto text-emerald-600 mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Births</p>
                      <p className="text-lg font-bold text-slate-900">{cow.parity || 0} Times</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                      <ShieldCheck size={20} className="mx-auto text-blue-600 mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pregnant</p>
                      <p className={`text-lg font-bold ${cow.is_pregnant ? 'text-emerald-600' : 'text-slate-400'}`}>{cow.is_pregnant ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                      <Droplets size={20} className="mx-auto text-emerald-600 mb-1" />
                      <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Avg Daily</p>
                      <p className="text-lg font-bold text-emerald-900">{avgYieldVal}L</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                      <Calendar size={20} className="mx-auto text-blue-600 mb-1" />
                      <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Milking Start</p>
                      <p className="text-xs font-bold text-blue-900 leading-tight mt-1">{cow.milking_start_date ? new Date(cow.milking_start_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Health Checklist</h4>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cow.is_vaccinated ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        {cow.is_vaccinated ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">Fully Vaccinated</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cow.is_dewormed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        {cow.is_dewormed ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">Dewormed Recently</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 font-serif">{cow.breed}</h1>
                <div className="flex gap-2">
                  {user?.id !== cow.seller_id && (
                    <button
                      onClick={handleToggleSave}
                      disabled={isSaving}
                      className={`p-3 rounded-2xl border transition-all ${isSaved
                        ? 'bg-red-50 border-red-100 text-red-500'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50'
                        }`}
                    >
                      <Heart size={20} fill={isSaved ? "currentColor" : "none"} className={isSaving ? 'opacity-50' : ''} />
                    </button>
                  )}
                  <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-6"><MapPin size={16} /><span className="text-sm">{cow.specific_location || cow.county}, {cow.county}</span></div>
              <div className="text-4xl font-black text-slate-900 mb-8">KSh {cow.price?.toLocaleString() || '0'}</div>
              <div className="space-y-4 mb-8">
                {user?.id === cow.seller_id ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <p className="text-sm font-bold text-slate-900 mb-3">This is your listing</p>
                    <Link
                      to="/dashboard/seller"
                      className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                    >
                      <LayoutDashboard size={18} /> Manage in Dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInspectionModal(true)}
                      className={`w-full py-4 ${existingRequest ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'} text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all`}
                    >
                      <CalendarDays size={20} /> {existingRequest ? 'Manage Inspection' : 'Request Inspection'}
                    </button>
                    <button className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-3"><MessageSquare size={20} /> Message Seller</button>
                  </>
                )}

                {/* Premium Features Section */}
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Premium Access</span>
                    </div>
                    <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded tracking-wider border border-amber-200">Locked</div>
                  </div>

                  <div className="space-y-4">
                    <div className="group relative overflow-hidden">
                      <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Exact Farm Location</p>
                          <div className="text-sm font-bold text-slate-900 blur-[4px] select-none pointer-events-none">Plot 42A, Green Valley View Road...</div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Lock size={16} className="text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="group relative overflow-hidden">
                      <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Phone size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Call Farmer</p>
                          <div className="text-sm font-bold text-slate-900 blur-[4px] select-none pointer-events-none">+254 712 345 XXX</div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Lock size={16} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                    Upgrade to Contact Directly
                  </button>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700">{seller?.full_name?.charAt(0) || '?'}</div>
                  <div><h4 className="font-bold text-slate-900">{seller?.full_name}</h4><p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{sellerProfile?.farm_name || 'Individual Seller'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInspectionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`${existingRequest ? 'bg-amber-500' : 'bg-emerald-600'} p-8 text-white text-center transition-colors`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Calendar size={32} />
              </div>
              <h3 className="text-2xl font-black font-serif">{existingRequest ? 'Reschedule Inspection' : 'Schedule Inspection'}</h3>
              <p className="text-white/80 italic">{existingRequest ? `Current date: ${new Date(existingRequest.preferred_date).toLocaleDateString()}` : `Request a visit to see ${cow.breed}`}</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{existingRequest ? 'New Date' : 'Preferred Date'}</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowInspectionModal(false)}
                  disabled={requestingInspection}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestInspection}
                  disabled={requestingInspection || !inspectionDate || (existingRequest && inspectionDate === existingRequest.preferred_date)}
                  className={`flex-1 py-4 ${existingRequest ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'} text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {requestingInspection ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {existingRequest ? 'Updating...' : 'Sending...'}
                    </>
                  ) : (
                    existingRequest ? 'Reschedule' : 'Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
