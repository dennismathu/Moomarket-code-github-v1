import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, MapPin, Smartphone, User, FileCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createOrUpdateSellerProfile, uploadImage } from '../lib/database';
import { FileUpload } from '../components/FileUpload';
import { COUNTIES } from '../data/counties';

const SellerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    phoneNumber: '',
    county: '',
    farmName: '',
    farmLocation: '',
    farmUniqId: '', // coordinates
    idFrontUrl: '',
    idBackUrl: '',
    idFrontPath: '',
    idBackPath: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: user.phone_number || '+254',
        county: user.county || '',
        farmName: prev.farmName || '',
        farmLocation: user.county && user.specific_location ? `${user.specific_location}, ${user.county}` : ''
      }));
    }
  }, [user]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.farmLocation || !formData.county) {
      setError('Please fill in phone number, county, and farm location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Update user phone number
      const { error: profileError } = await updateProfile({
        phone_number: formData.phoneNumber
      });
      if (profileError) throw profileError;

      // 2. Create/Update seller profile with farm name
      const finalFarmName = formData.farmName.trim() || `${user.full_name}'s Farm`;
      const { error: sellerError } = await createOrUpdateSellerProfile(user!.id, {
        farm_name: finalFarmName,
        farm_location: formData.farmLocation,
        county: formData.county,
        verification_status: 'pending' // Reset to pending if they are re-onboarding
      });
      if (sellerError) throw sellerError;

      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to save farm details');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          farmLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          farmUniqId: `${latitude},${longitude}`
        }));
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleStep2 = async (skip = false) => {
    if (!skip && (!formData.idFrontUrl || !formData.idBackUrl)) {
      setError('Please upload both sides of your ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update seller profile logic
      const finalFarmName = formData.farmName.trim() || `${user.full_name}'s Farm`;
      const updates: any = {
        verification_status: 'pending', // 'unverified' is not a valid enum value, using 'pending' as default
        farm_name: finalFarmName,
        farm_location: formData.farmLocation,
        county: formData.county
      };

      if (!skip) {
        updates.id_front_url = formData.idFrontUrl;
        updates.id_back_url = formData.idBackUrl;
        updates.id_front_path = formData.idFrontPath;
        updates.id_back_path = formData.idBackPath;
      }

      // Update seller profile with ID document URLs (if not skipping)
      const { error: sellerError } = await createOrUpdateSellerProfile(user!.id, updates);
      if (sellerError) throw sellerError;

      // Update user role to seller
      const { error: profileUpdateError } = await updateProfile({
        is_id_verified: false,
        role: 'seller'
      });
      if (profileUpdateError) throw profileUpdateError;

      await refreshUser();

      if (skip) {
        navigate('/seller/new-listing');
      } else {
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit documents');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/seller/new-listing');
  };

  if (!user) return null;

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
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+254 7..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Farm Name <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                    <input
                      type="text"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      placeholder={`e.g. ${user.full_name}'s Farm`}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Farm Location / Coordinates</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.farmLocation}
                        onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                        placeholder="e.g. Kiambu, Ruiru"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="button"
                        onClick={getUserLocation}
                        className="p-4 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        title="Use Current Location"
                      >
                        <MapPin size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                Next
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">ID Verification</p>
                    <p className="text-xs text-slate-500 tracking-tight">Upload National ID or Passport</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUpload
                    type="photo"
                    bucket="id-documents"
                    folder={`${user.id}/id`}
                    label="ID Front"
                    onUploadComplete={(url, path) => setFormData({ ...formData, idFrontUrl: url, idFrontPath: path })}
                    initialPreview={formData.idFrontUrl}
                  />
                  <FileUpload
                    type="photo"
                    bucket="id-documents"
                    folder={`${user.id}/id`}
                    label="ID Back"
                    onUploadComplete={(url, path) => setFormData({ ...formData, idBackUrl: url, idBackPath: path })}
                    initialPreview={formData.idBackUrl}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => handleStep2(true)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => handleStep2(false)}
                  disabled={loading || !formData.idFrontUrl || !formData.idBackUrl}
                  className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={20} className="animate-spin" />}
                  Submit Documents
                </button>
              </div>
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
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
              >
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

