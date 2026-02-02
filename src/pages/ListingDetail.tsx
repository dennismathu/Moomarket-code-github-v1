
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, Calendar, MapPin, ShieldCheck, Heart, Share2, ArrowLeft, MessageSquare, CalendarDays, Check, Info, AlertTriangle, Truck, Play, X, Baby, Smartphone, Droplets, Phone, Lock, Zap } from 'lucide-react';
import { MOCK_LISTINGS, MOCK_USERS } from '../data/mockData';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activePhoto, setActivePhoto] = useState(0);
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
      setActivePhoto((prev) => (prev + 1) % (cow?.photos.length || 1));
    }
    if (isRightSwipe) {
      setActivePhoto((prev) => (prev - 1 + (cow?.photos.length || 1)) % (cow?.photos.length || 1));
    }
  };

  const cow = MOCK_LISTINGS.find(c => c.id === id);
  const seller = cow ? MOCK_USERS.find(u => u.id === cow.seller_id) : null;

  if (!cow) {
    return <div className="p-20 text-center">Listing not found</div>;
  }

  const avgYield = (cow.milk_yield_last_7_days.reduce((a, b) => a + b, 0) / cow.milk_yield_last_7_days.length).toFixed(1);

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
              {cow.vet_verification.verified && cow.vet_verification.report_url ? (
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
                <img src={cow.photos[activePhoto]} alt={cow.breed} className="w-full h-full object-cover transition-opacity duration-500" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {cow.photos.map((_, idx) => (
                    <button key={idx} onClick={() => setActivePhoto(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${activePhoto === idx ? 'bg-white w-6' : 'bg-white/40'}`} />
                  ))}
                </div>
              </div>
              <div className="p-4 flex gap-4 overflow-x-auto">
                {cow.photos.map((photo, idx) => (
                  <button key={idx} onClick={() => setActivePhoto(idx)} className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === idx ? 'border-emerald-500 shadow-lg' : 'border-transparent opacity-60'}`}>
                    <img src={photo} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative group cursor-pointer">
              <video src={cow.video} className="w-full h-64 md:h-96 object-cover opacity-60" poster={cow.photos[1]} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform">
                  <Play size={40} fill="currentColor" className="ml-1" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                <div><h4 className="font-bold text-lg">Verified Video Proof</h4><p className="text-sm text-slate-300">Walking and milking clip included</p></div>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/20">0:34s</div>
              </div>
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
                      {cow.milk_yield_last_7_days.map((val, i) => (
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
                      <p className="text-lg font-bold text-emerald-900">{avgYield}L</p>
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
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cow.health.vaccinated ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        {cow.health.vaccinated ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">Fully Vaccinated</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${cow.health.dewormed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                        {cow.health.dewormed ? <Check size={12} strokeWidth={3} /> : <X size={12} />}
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
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-serif">{cow.breed}</h1>
              <div className="flex items-center gap-2 text-slate-500 mb-6"><MapPin size={16} /><span className="text-sm">{cow.location}</span></div>
              <div className="text-4xl font-black text-slate-900 mb-8">KSh {cow.price.toLocaleString()}</div>
              <div className="space-y-4 mb-8">
                <button onClick={() => setShowInspectionModal(true)} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center justify-center gap-3"><CalendarDays size={20} /> Request Inspection</button>
                <button className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 flex items-center justify-center gap-3"><MessageSquare size={20} /> Message Seller</button>

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
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold">{cow.seller_name.charAt(0)}</div>
                  <div><h4 className="font-bold text-slate-900">{cow.seller_name}</h4><p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{cow.seller_farm}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInspectionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-emerald-600 p-8 text-white text-center"><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={32} /></div><h3 className="text-2xl font-bold">Schedule Inspection</h3></div>
            <div className="p-8 space-y-6">
              <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Preferred Date</label><input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
              <div className="flex gap-4"><button onClick={() => setShowInspectionModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button><button onClick={() => setShowInspectionModal(false)} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">Request</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
