import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createListing, addListingMedia } from '../lib/database';
import { FileUpload } from '../components/FileUpload';
import { ChevronRight, Camera, Video, FileText, Check, AlertCircle, MapPin, Baby, Calendar, ArrowLeft, Droplets, Loader2 } from 'lucide-react';

interface UploadedFile {
  url: string;
  path: string;
  type: 'photo' | 'video_walking' | 'video_milking';
}

export default function NewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    breed: '',
    age: '',
    parity: '',
    lactationStage: 'Mid' as 'Early' | 'Mid' | 'Late' | 'Dry',
    isPregnant: false,
    price: '',
    county: '',
    specificLocation: '',
    vaccinated: false,
    dewormed: false,
    milkYield: [0, 0, 0, 0, 0, 0, 0],
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const counties = ["Kiambu", "Nakuru", "Nyeri", "Murang'a", "Bomet", "Meru", "Uasin Gishu", "Kericho", "Nyandarua", "Kirinyaga"];
  const breeds = ["Friesian", "Ayrshire", "Jersey", "Guernsey", "Crossbreed"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFileUpload = (url: string, path: string, type: string, index?: number) => {
    if (type === 'photo' && index !== undefined) {
      setUploadedFiles(prev => {
        const newFiles = [...prev];
        const photoIndex = prev.filter(f => f.type === 'photo' || f.type === 'photo_slot').findIndex((_, i) => i === index);

        // Find existing photo at this logical slot or append
        const photos = prev.filter(f => f.type === 'photo');
        const otherMedia = prev.filter(f => f.type !== 'photo');

        const newPhotos = [...photos];
        newPhotos[index] = { url, path, type: 'photo' };

        return [...newPhotos.filter(Boolean), ...otherMedia];
      });
    } else {
      setUploadedFiles(prev => [...prev, { url, path, type: type as any }]);
    }
  };

  const handleSubmit = async (status: 'pending' | 'draft') => {
    if (!user) {
      setError('You must be logged in to create a listing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the listing
      const listingData = {
        seller_id: user.id,
        breed: formData.breed,
        age: parseInt(formData.age),
        parity: parseInt(formData.parity),
        price: parseFloat(formData.price),
        lactation_stage: formData.lactationStage,
        is_pregnant: formData.isPregnant,
        milk_yield_day_1: formData.milkYield[0],
        milk_yield_day_2: formData.milkYield[1],
        milk_yield_day_3: formData.milkYield[2],
        milk_yield_day_4: formData.milkYield[3],
        milk_yield_day_5: formData.milkYield[4],
        milk_yield_day_6: formData.milkYield[5],
        milk_yield_day_7: formData.milkYield[6],
        is_vaccinated: formData.vaccinated,
        is_dewormed: formData.dewormed,
        county: formData.county,
        specific_location: formData.specificLocation,
        status: status,
      };

      const { data: listing, error: listingError } = await createListing(listingData);

      if (listingError || !listing) {
        throw new Error(listingError?.message || 'Failed to create listing');
      }

      // Add media files
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        await addListingMedia(
          listing.id,
          file.url,
          file.path,
          file.type,
          i
        );
      }

      // Success! Navigate to dashboard
      navigate('/dashboard/seller');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      setLoading(false);
    }
  };

  const avgYield = (formData.milkYield.reduce((a, b) => a + b, 0) / 7).toFixed(1);
  const photoCount = uploadedFiles.filter(f => f.type === 'photo').length;
  const videoCount = uploadedFiles.filter(f => f.type !== 'photo').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard/seller')}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-slate-900 font-serif">List Your Cow</h1>
          <p className="text-slate-500 mt-2">Fill in the details to create a verified listing</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                {step > s ? <Check size={20} /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Form Steps */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Breed</label>
                <select
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="">Select breed</option>
                  {breeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Age (years)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g., 4"
                    min="1"
                    max="20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Number of Calvings</label>
                  <input
                    type="number"
                    value={formData.parity}
                    onChange={(e) => setFormData({ ...formData, parity: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g., 2"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Price (KSh)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g., 120000"
                  min="1000"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.isPregnant}
                  onChange={(e) => setFormData({ ...formData, isPregnant: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm font-medium text-slate-700">Currently Pregnant</label>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.breed || !formData.age || !formData.parity || !formData.price}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Milk Production */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Milk Production</h2>
              <p className="text-slate-500">Enter daily milk yield for the last 7 days (in liters)</p>

              <div className="grid grid-cols-7 gap-2">
                {formData.milkYield.map((yieldValue, index) => (
                  <div key={index}>
                    <label className="block text-xs font-bold text-slate-400 mb-1">Day {index + 1}</label>
                    <input
                      type="number"
                      value={yieldValue}
                      onChange={(e) => {
                        const newYield = [...formData.milkYield];
                        newYield[index] = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, milkYield: newYield });
                      }}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-center"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Droplets className="text-emerald-600" size={20} />
                  <span className="text-sm font-medium text-slate-700">Average Daily Yield:</span>
                  <span className="text-lg font-bold text-emerald-600">{avgYield}L</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lactation Stage</label>
                <select
                  value={formData.lactationStage}
                  onChange={(e) => setFormData({ ...formData, lactationStage: e.target.value as any })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Early">Early (0-100 days)</option>
                  <option value="Mid">Mid (100-200 days)</option>
                  <option value="Late">Late (200+ days)</option>
                  <option value="Dry">Dry (not milking)</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location & Health */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Location & Health</h2>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">County</label>
                <select
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="">Select county</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specific Location</label>
                <input
                  type="text"
                  value={formData.specificLocation}
                  onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g., Limuru Town"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Health Status</label>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.vaccinated}
                    onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-slate-700">Vaccinated</label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.dewormed}
                    onChange={(e) => setFormData({ ...formData, dewormed: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-slate-700">Dewormed</label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.county || !formData.specificLocation}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Photos & Videos */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Photos & Videos</h2>
              <p className="text-slate-500">Upload photos and videos of your cow (optional but recommended)</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => {
                  const existingPhoto = uploadedFiles.filter(f => f.type === 'photo')[i];
                  return (
                    <div key={i} className="space-y-2">
                      <FileUpload
                        type="photo"
                        label={`Photo ${i + 1}`}
                        accept="image/*"
                        maxSizeMB={5}
                        onUploadComplete={(url, path) => handleFileUpload(url, path, 'photo')}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">Add exactly 3 high-quality photos (required)</p>

              <FileUpload
                type="video_walking"
                label="Walking Video (Optional)"
                accept="video/*"
                maxSizeMB={100}
                onUploadComplete={(url, path) => handleFileUpload(url, path, 'video_walking')}
              />

              <FileUpload
                type="video_milking"
                label="Milking Video (Optional)"
                accept="video/*"
                maxSizeMB={100}
                onUploadComplete={(url, path) => handleFileUpload(url, path, 'video_milking')}
              />

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Listings with photos and videos get 3x more inquiries!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-4 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  className="flex-1 py-4 border border-emerald-200 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('pending')}
                  className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Publish Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
