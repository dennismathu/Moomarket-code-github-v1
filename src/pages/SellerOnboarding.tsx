
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, MapPin, Smartphone, User, FileCheck } from 'lucide-react';

const SellerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleComplete = () => {
    navigate('/seller/new-listing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-200">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} />
          </div>
          <h2 className="text-3xl font-extrabold">Seller Verification</h2>
          <p className="text-emerald-100 mt-2">Become a verified MooMarket dairy farmer.</p>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Smartphone size={20} /></div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input type="tel" placeholder="+254 7..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><MapPin size={20} /></div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Farm Name</label>
                    <input type="text" placeholder="e.g. Kinuthia Dairy" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Verify Phone Number</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600"><FileCheck size={24} /></div>
                   <div>
                     <p className="font-bold text-slate-900">ID Verification</p>
                     <p className="text-xs text-slate-500 tracking-tight">Upload National ID or Passport</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white hover:border-emerald-500 transition-colors cursor-pointer">
                    <Smartphone size={24} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase">Front</span>
                  </div>
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white hover:border-emerald-500 transition-colors cursor-pointer">
                    <Smartphone size={24} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase">Back</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(3)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Submit Documents</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">Identity Vetted!</h3>
              <p className="text-slate-500 leading-relaxed">
                Thank you. We've received your documents. You can now start listing your cows. 
                Your profile will display a <span className="text-emerald-600 font-bold">"Pending Verification"</span> badge until our admin manually confirms your ID.
              </p>
              <button onClick={handleComplete} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                Go to Listing Form
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center flex items-center gap-2">
        <Shield size={12} /> Your data is secure and encrypted for verification purposes only.
      </p>
    </div>
  );
};

export default SellerOnboarding;
