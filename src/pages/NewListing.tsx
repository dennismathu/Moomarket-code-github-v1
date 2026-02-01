
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, Video, FileText, Check, AlertCircle, MapPin, Baby, Calendar, Play, Eye, ShieldCheck, ArrowLeft, X, Droplets, BadgeCheck, Smartphone } from 'lucide-react';

const NewListing: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSampleVideo, setShowSampleVideo] = useState(false);
  const [formData, setFormData] = useState({
    breed: '',
    age: '',
    parity: '',
    milkingStartDate: '',
    isPregnant: false,
    price: '',
    county: '',
    specificLocation: '',
    hasMapLocation: false,
    vaccinated: false,
    dewormed: false,
    milkYield: [0, 0, 0, 0, 0, 0, 0],
    vetReportUploaded: false
  });

  const counties = ["Kiambu", "Nakuru", "Nyeri", "Murang'a", "Bomet", "Meru", "Uasin Gishu", "Kericho", "Nyandarua", "Kirinyaga"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleShareLocation = () => {
    setIsGettingLocation(true);
    setTimeout(() => {
      setIsGettingLocation(false);
      setFormData({...formData, hasMapLocation: true});
    }, 1500);
  };

  const handleSubmit = (status: 'pending' | 'draft') => {
    // Logic to save to backend would go here
    navigate('/dashboard/seller');
  };

  // Mock average yield for preview
  const avgYield = (formData.milkYield.reduce((a, b) => a + b, 0) / formData.milkYield.length).toFixed(1);

  if (isPreview) {
    return (
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setIsPreview(false)} className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <ArrowLeft size={18} /> Back to Editor
            </button>
            <div className="flex gap-4">
              <button onClick={() => handleSubmit('draft')} className="px-6 py-2 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl text-sm">Save as Draft</button>
              <button onClick={() => handleSubmit('pending')} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-100">Publish Listing</button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
             <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                   <div>
                      <h1 className="text-4xl font-black text-slate-900 font-serif mb-2">{formData.breed || 'Your Cow Breed'}</h1>
                      <div className="flex items-center gap-2 text-slate-500"><MapPin size={16} /> {formData.specificLocation}, {formData.county}</div>
                   </div>
                   <div className="text-right">
                      <p className="text-3xl font-black text-slate-900">KSh {formData.price || '0'}</p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <Droplets size={14} className="text-emerald-500" />
                        <span className="text-lg font-black text-emerald-600 tracking-tighter">{avgYield}L AVG</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="aspect-[4/3] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                      <Camera size={48} />
                   </div>
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Baby size={20} className="text-emerald-600 mb-1" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Births</p>
                            <p className="text-lg font-bold">{formData.parity || '0'} Times</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <ShieldCheck size={20} className="text-blue-600 mb-1" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pregnant</p>
                            <p className="text-lg font-bold">{formData.isPregnant ? 'Yes' : 'No'}</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Calendar size={20} className="text-indigo-600 mb-1" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Age</p>
                            <p className="text-lg font-bold">{formData.age || '0'} Years</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <Play size={20} className="text-amber-600 mb-1" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Media</p>
                            <p className="text-lg font-bold">Pending Upload</p>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health & Trust Badges</p>
                         <div className="flex flex-wrap gap-2">
                            {formData.vetReportUploaded && <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1"><BadgeCheck size={14}/> VET VERIFIED</div>}
                            {formData.vaccinated && <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1"><Check size={14}/> VACCINATED</div>}
                            {formData.dewormed && <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1"><Check size={14}/> DEWORMED</div>}
                            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1"><Smartphone size={14}/> PHONE VERIFIED</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="mt-8 text-center text-slate-400 text-sm italic">
            This is a preview of how your listing will appear to buyers.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-serif">List Your Cow</h1>
          <p className="text-slate-500">Provide accurate details to build trust with buyers.</p>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}
            >
              {step > s ? <Check size={20} /> : s}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold flex items-center gap-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Breed</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} required>
                      <option value="">Select Breed</option>
                      <option>Friesian</option>
                      <option>Ayrshire</option>
                      <option>Jersey</option>
                      <option>Guernsey</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age (Years)</label>
                    <input type="number" placeholder="e.g. 4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Times gave birth (Parity) <Baby size={12} className="text-slate-400" /></label>
                    <input type="number" placeholder="e.g. 2" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.parity} onChange={e => setFormData({...formData, parity: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">When did milking start? <Calendar size={12} className="text-slate-400" /></label>
                    <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.milkingStartDate} onChange={e => setFormData({...formData, milkingStartDate: e.target.value})} required />
                  </div>
                  
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pregnancy Status</label>
                    <div className="flex gap-4 mt-2">
                      <button type="button" onClick={() => setFormData({...formData, isPregnant: true})} className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${formData.isPregnant ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><Check size={18} className={formData.isPregnant ? 'opacity-100' : 'opacity-0'} /> She is pregnant</button>
                      <button type="button" onClick={() => setFormData({...formData, isPregnant: false})} className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${!formData.isPregnant ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><Check size={18} className={!formData.isPregnant ? 'opacity-100' : 'opacity-0'} /> Not pregnant</button>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price (KSh)</label>
                    <input type="number" placeholder="e.g. 200000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Location Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">County</label>
                      <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.county} onChange={e => setFormData({...formData, county: e.target.value})} required>
                        <option value="">Select County</option>
                        {counties.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Location (Area/Village)</label>
                      <input type="text" placeholder="e.g. Limuru, Githunguri" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={formData.specificLocation} onChange={e => setFormData({...formData, specificLocation: e.target.value})} required />
                    </div>
                  </div>
                  <button type="button" onClick={handleShareLocation} className={`w-full py-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all ${formData.hasMapLocation ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`}>
                    {isGettingLocation ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Detecting Location...</span>
                    ) : formData.hasMapLocation ? (
                      <span className="flex items-center gap-2 font-bold"><Check size={18} /> Location Linked to Map</span>
                    ) : (
                      <span className="flex items-center gap-2 font-medium"><MapPin size={18} /> Share Map Location (Optional)</span>
                    )}
                  </button>
                </div>

                <div className="pt-6">
                  <button type="button" onClick={handleNext} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">Next Step <ChevronRight size={20} /></button>
                </div>
              </div>
            )}

            {/* Step 2: Health & Production */}
            {step === 2 && (
              <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold">Health & Production Records</h3>
                
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Milk Yield (Liters - Last 7 Days)</label>
                  <div className="grid grid-cols-7 gap-2">
                    {formData.milkYield.map((yieldVal, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[10px] text-slate-400 text-center block font-bold">Day {idx+1}</span>
                        <input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" value={yieldVal || ''} onChange={e => {
                          const newYield = [...formData.milkYield];
                          newYield[idx] = Number(e.target.value);
                          setFormData({...formData, milkYield: newYield});
                        }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Animal Health Status</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.vaccinated ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                        checked={formData.vaccinated} 
                        onChange={(e) => setFormData({...formData, vaccinated: e.target.checked})} 
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Fully Vaccinated</p>
                        <p className="text-[10px] text-slate-500">Includes Foot & Mouth, etc.</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.dewormed ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-100'}`}>
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" 
                        checked={formData.dewormed} 
                        onChange={(e) => setFormData({...formData, dewormed: e.target.checked})} 
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Dewormed Recently</p>
                        <p className="text-[10px] text-slate-500">Within the last 3 months</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={handleBack} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl">Back</button>
                  <button type="button" onClick={handleNext} className="flex-2 py-4 px-10 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">Next Step <ChevronRight size={20} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Media & Verification */}
            {step === 3 && (
              <div className="p-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold mb-4">Media Uploads</h3>
                  
                  {/* Photo Upload Section */}
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cow Photos (Upload 3)</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:bg-white cursor-pointer transition-all group">
                           <Camera size={24} className="group-hover:text-emerald-500 mb-1" />
                           <span className="text-[10px] font-bold uppercase">Photo {i}</span>
                           <input type="file" className="hidden" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-8">Follow these templates to ensure your listing is approved quickly.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Template: Walking Shot */}
                    <div className="space-y-4">
                      <div className="relative group overflow-hidden rounded-3xl border-2 border-emerald-100 bg-emerald-50 aspect-video flex items-center justify-center">
                        <div className="absolute inset-0 bg-emerald-600/5 flex flex-col items-center justify-center p-6 text-center">
                           <Video size={48} className="text-emerald-300 mb-4" />
                           <p className="font-bold text-emerald-900">Walking Shot Template</p>
                           <p className="text-xs text-emerald-600 mt-2">Take a 10s video of the cow walking towards and away from you to show leg health.</p>
                        </div>
                        <div className="absolute inset-4 border-2 border-emerald-400/30 border-dashed rounded-2xl flex items-center justify-center pointer-events-none">
                           <div className="w-3/4 h-1/2 bg-emerald-400/10 rounded-full border border-emerald-400/40"></div>
                        </div>
                        <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-emerald-600/60 backdrop-blur-sm transition-all flex items-center justify-center text-white font-bold text-sm text-center p-4">
                           Click to Upload Walking Clip
                           <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* Template: Milking Shot */}
                    <div className="space-y-4">
                      <div className="relative group overflow-hidden rounded-3xl border-2 border-blue-100 bg-blue-50 aspect-video flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-600/5 flex flex-col items-center justify-center p-6 text-center">
                           <Video size={48} className="text-blue-300 mb-4" />
                           <p className="font-bold text-blue-900">Milking Shot Template</p>
                           <p className="text-xs text-blue-600 mt-2">A close-up 10s clip during milking to verify udder health and yield consistency.</p>
                        </div>
                        <div className="absolute inset-4 border-2 border-blue-400/30 border-dashed rounded-2xl flex items-center justify-center pointer-events-none">
                           <div className="w-1/2 h-1/2 bg-blue-400/10 rounded-lg border border-blue-400/40 mt-8"></div>
                        </div>
                        <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-blue-600/60 backdrop-blur-sm transition-all flex items-center justify-center text-white font-bold text-sm text-center p-4">
                           Click to Upload Milking Clip
                           <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setShowSampleVideo(!showSampleVideo)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    {showSampleVideo ? <Eye size={16} /> : <Play size={16} />} 
                    {showSampleVideo ? "Close Sample Video" : "Watch Sample Milking Clip Video (30s)"}
                  </button>

                  {showSampleVideo && (
                    <div className="mt-4 aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                      <video 
                        src="https://www.w3schools.com/html/mov_bbb.mp4" 
                        controls 
                        className="w-full h-full object-cover"
                        autoPlay
                      />
                    </div>
                  )}
                </div>

                <div className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${formData.vetReportUploaded ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`} onClick={() => setFormData({...formData, vetReportUploaded: !formData.vetReportUploaded})}>
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${formData.vetReportUploaded ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <FileText size={32} />
                      </div>
                      <div className="flex-1">
                         <h4 className={`font-bold text-lg ${formData.vetReportUploaded ? 'text-emerald-900' : 'text-slate-900'}`}>Vet Verification Report</h4>
                         <p className="text-xs text-slate-500 leading-relaxed">
                           Upload a signed report from a registered vet clinic to earn the <span className="text-emerald-600 font-bold">VET VERIFIED</span> badge.
                         </p>
                      </div>
                      {formData.vetReportUploaded && <Check className="text-emerald-600" size={32} />}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <button type="button" onClick={handleBack} className="py-4 bg-slate-100 text-slate-600 font-bold rounded-xl">Back</button>
                  <button type="button" onClick={() => setIsPreview(true)} className="py-4 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                    <Eye size={18} /> Preview Listing
                  </button>
                  <button type="button" onClick={() => handleSubmit('draft')} className="py-4 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl">
                    Save as Draft
                  </button>
                  <button type="button" onClick={() => handleSubmit('pending')} className="py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100">
                    Submit for Review
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewListing;
