import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, MapPin, BadgeCheck, ChevronDown, List, LayoutGrid, Smartphone, ShieldCheck, Droplets, Baby, Activity, Loader2, AlertCircle, ArrowRight, Calendar, Milk, Syringe, BugOff } from 'lucide-react';
import { getListings, getSellerProfile } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: string;
  breed: string;
  age: number;
  price: number;
  county: string;
  specific_location: string;
  is_pregnant: boolean;
  is_vaccinated: boolean;
  is_dewormed: boolean;
  avg_milk_yield: number;
  status: string;
  seller: {
    full_name: string;
    is_phone_verified: boolean;
    is_id_verified: boolean;
    seller_profile: {
      farm_name: string | null;
      rating: number | null;
    } | null;
  };
  media: Array<{
    media_url: string;
    media_type: string;
  }>;
}

export default function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboardingNudge, setShowOnboardingNudge] = useState(false);

  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [filterCounty, setFilterCounty] = useState<string>('All');
  const [minMilkYield, setMinMilkYield] = useState<number>(0);
  const [isPregnantOnly, setIsPregnantOnly] = useState(false);
  const [isVaccinatedOnly, setIsVaccinatedOnly] = useState(false);
  const [isDewormedOnly, setIsDewormedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Fetch listings on mount
  useEffect(() => {
    fetchListings();
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (user?.role === 'seller') {
      const { data } = await getSellerProfile(user.id);
      // If no profile or status is still null, show nudge
      if (!data || !data.verification_status) {
        setShowOnboardingNudge(true);
      }
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getListings({
        status: 'approved',
      });

      if (fetchError) {
        console.error('Marketplace fetch error:', fetchError);
        throw fetchError;
      }

      setListings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchBreed = filterBreed === 'All' || listing.breed === filterBreed;
      const matchCounty = filterCounty === 'All' || listing.county === filterCounty;
      const matchYield = listing.avg_milk_yield >= minMilkYield;
      const matchPregnant = !isPregnantOnly || listing.is_pregnant;
      const matchVaccinated = !isVaccinatedOnly || listing.is_vaccinated;
      const matchDewormed = !isDewormedOnly || listing.is_dewormed;
      const matchMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
      const matchMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);

      const matchSearch = listing.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.specific_location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchBreed && matchCounty && matchYield &&
        matchPregnant && matchVaccinated && matchDewormed &&
        matchMinPrice && matchMaxPrice &&
        matchSearch;
    });
  }, [listings, filterBreed, filterCounty, minMilkYield, isPregnantOnly, isVaccinatedOnly, isDewormedOnly, searchTerm, minPrice, maxPrice]);

  const clearFilters = () => {
    setFilterBreed('All');
    setFilterCounty('All');
    setMinMilkYield(0);
    setIsPregnantOnly(false);
    setIsVaccinatedOnly(false);
    setIsDewormedOnly(false);
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
  };

  const counties = ["Kiambu", "Nakuru", "Nyeri", "Murang'a", "Bomet", "Meru", "Uasin Gishu", "Kericho", "Nyandarua", "Kirinyaga"];
  const breeds = ["Friesian", "Ayrshire", "Jersey", "Guernsey", "Crossbreed"];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Cow Marketplace</h1>
            <p className="text-slate-500">
              {loading ? 'Loading...' : `Browse ${filteredListings.length} verified dairy cows across Kenya.`}
            </p>
          </div>

          {showOnboardingNudge && (
            <div className="flex-1 max-w-2xl bg-emerald-600 rounded-2xl p-4 md:p-6 text-white shadow-lg shadow-emerald-100 animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    < ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Complete Your Seller Profile</h3>
                    <p className="text-emerald-100 text-sm">You need to verify your identity before you can list your cows for sale.</p>
                  </div>
                </div>
                <Link
                  to="/seller/onboarding"
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors whitespace-nowrap"
                >
                  Verify Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} /></button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <aside className="mb-8 lg:mb-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-800">Filters</h3>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-8">
                {/* Search */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Breed or location..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Budget */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Budget (KSh)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Breed</label>
                  <select
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    value={filterBreed}
                    onChange={(e) => setFilterBreed(e.target.value)}
                  >
                    <option>All</option>
                    {breeds.map(breed => (
                      <option key={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                {/* County */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">County</label>
                  <select
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    value={filterCounty}
                    onChange={(e) => setFilterCounty(e.target.value)}
                  >
                    <option>All</option>
                    {counties.map(county => (
                      <option key={county}>{county}</option>
                    ))}
                  </select>
                </div>

                {/* Milk Yield */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Droplets size={12} className="text-emerald-500" /> Min Yield (L)
                    </label>
                    <span className="text-xs font-black text-emerald-600">{minMilkYield}L+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    value={minMilkYield}
                    onChange={(e) => setMinMilkYield(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[10px] text-slate-300 font-bold">0</span>
                    <span className="text-[10px] text-slate-300 font-bold">20</span>
                    <span className="text-[10px] text-slate-300 font-bold">40</span>
                  </div>
                </div>

                {/* Health Filters */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Health Status</label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={isPregnantOnly}
                      onChange={(e) => setIsPregnantOnly(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Pregnant Only</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={isVaccinatedOnly}
                      onChange={(e) => setIsVaccinatedOnly(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Fully Vaccinated</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={isDewormedOnly}
                      onChange={(e) => setIsDewormedOnly(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Recently Dewormed</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
                <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">Loading listings...</h3>
                <p className="text-sm text-slate-500">Please wait while we fetch the latest cows</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Error loading listings</h3>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
                <button
                  onClick={fetchListings}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100"
                >
                  Try Again
                </button>
              </div>
            ) : filteredListings.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredListings.map((listing) => {
                  const photo = listing.media && listing.media.length > 0
                    ? listing.media.find(m => m.media_type === 'photo')?.media_url || '/placeholder-cow.jpg'
                    : '/placeholder-cow.jpg';

                  return (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className={`bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {/* Image Section */}
                      <div className={`relative ${viewMode === 'list' ? 'sm:w-80 h-72 sm:h-auto' : 'h-72'} overflow-hidden`}>
                        <img
                          src={photo}
                          alt={listing.breed}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute bottom-5 right-5 flex items-center gap-1.5 px-4 py-2 bg-slate-900/40 backdrop-blur-xl text-white rounded-full text-[11px] font-bold border border-white/20 shadow-2xl">
                          <MapPin size={14} className="text-emerald-400" />
                          {listing.county}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 md:p-6 flex flex-col justify-between flex-grow">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <h3
                                className="text-xl font-bold text-slate-900 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors truncate"
                                style={{ fontFamily: "Calibri, 'Segoe UI', Candara, Arial, sans-serif" }}
                              >
                                {listing.breed}
                              </h3>
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                  {listing.age} Years Old
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                              <p className="text-xl font-black text-emerald-600 tracking-tight">
                                <span className="text-xs font-bold mr-0.5">KSh</span>
                                {listing.price.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Stats & Health Badges Row */}
                          <div className="flex items-center gap-2 overflow-hidden">
                            {/* Minimalist Milk Section */}
                            <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-100/50 flex-shrink-0">
                              <Milk size={14} strokeWidth={2.5} className="text-emerald-600" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Milk per Day:</span>
                              <p className="text-[10px] font-black text-slate-900 leading-none">
                                {listing.avg_milk_yield.toFixed(1)} <span className="text-slate-400 font-bold ml-0.5">L</span>
                              </p>
                            </div>

                            {/* Health Badges - Max 2 (Icons only) */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {[
                                listing.is_pregnant && { icon: <Baby size={12} />, label: 'Pregnant', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                                listing.is_vaccinated && { icon: <Syringe size={12} />, label: 'Vaccinated', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                                listing.is_dewormed && { icon: <BugOff size={12} />, label: 'Dewormed', color: 'bg-orange-50 text-orange-600 border-orange-100' }
                              ]
                                .filter((b): b is { icon: React.ReactNode; label: string; color: string } => !!b)
                                .slice(0, 2)
                                .map((badge, idx) => (
                                  <div
                                    key={idx}
                                    title={badge.label}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg border shadow-sm transition-transform hover:scale-110 ${badge.color}`}
                                  >
                                    {badge.icon}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer Section - Optimized for Seller Name */}
                        <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center text-[9px] font-black text-slate-600 uppercase overflow-hidden flex-shrink-0">
                              {listing.seller.full_name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Seller</span>
                              <span className="text-[10px] font-bold text-slate-900 truncate" title={listing.seller.full_name}>
                                {listing.seller.full_name}
                              </span>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95 group/btn whitespace-nowrap">
                              View
                              <ArrowRight size={14} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No results found</h3>
                <p className="text-sm text-slate-500 mb-6">Try adjusting your filters to find more cows.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
