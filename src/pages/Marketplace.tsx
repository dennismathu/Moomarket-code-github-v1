
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, MapPin, BadgeCheck, ChevronDown, List, LayoutGrid, Smartphone, ShieldCheck, Droplets, Baby, Activity } from 'lucide-react';
import { MOCK_LISTINGS, MOCK_USERS } from '../data/mockData';

const Marketplace: React.FC = () => {
  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [filterCounty, setFilterCounty] = useState<string>('All');
  const [minMilkYield, setMinMilkYield] = useState<number>(0);
  const [isVetOnly, setIsVetOnly] = useState(false);
  const [isPregnantOnly, setIsPregnantOnly] = useState(false);
  const [isVaccinatedOnly, setIsVaccinatedOnly] = useState(false);
  const [isDewormedOnly, setIsDewormedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter(cow => {
      const avgYield = cow.milk_yield_last_7_days.reduce((a, b) => a + b, 0) / cow.milk_yield_last_7_days.length;

      const matchBreed = filterBreed === 'All' || cow.breed === filterBreed;
      const matchCounty = filterCounty === 'All' || cow.location.includes(filterCounty);
      const matchVet = !isVetOnly || cow.vet_verification.verified;
      const matchYield = avgYield >= minMilkYield;
      const matchPregnant = !isPregnantOnly || cow.is_pregnant;
      const matchVaccinated = !isVaccinatedOnly || cow.health.vaccinated;
      const matchDewormed = !isDewormedOnly || cow.health.dewormed;

      const matchSearch = cow.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cow.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Allow pending for demo purposes, usually only approved
      const approvedOnly = cow.status === 'approved' || cow.status === 'pending';

      return matchBreed && matchCounty && matchVet && matchYield &&
        matchPregnant && matchVaccinated && matchDewormed &&
        matchSearch && approvedOnly;
    });
  }, [filterBreed, filterCounty, isVetOnly, minMilkYield, isPregnantOnly, isVaccinatedOnly, isDewormedOnly, searchTerm]);

  const clearFilters = () => {
    setFilterBreed('All');
    setFilterCounty('All');
    setMinMilkYield(0);
    setIsVetOnly(false);
    setIsPregnantOnly(false);
    setIsVaccinatedOnly(false);
    setIsDewormedOnly(false);
    setSearchTerm('');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Cow Marketplace</h1>
            <p className="text-slate-500">Browse {filteredListings.length} verified dairy cows across Kenya.</p>
          </div>
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

                {/* Breed */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Breed</label>
                  <select
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                    value={filterBreed}
                    onChange={(e) => setFilterBreed(e.target.value)}
                  >
                    <option>All</option>
                    <option>Friesian</option>
                    <option>Ayrshire</option>
                    <option>Jersey</option>
                    <option>Guernsey</option>
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

                {/* Verification & Health */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trust & Health</label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-emerald-600 checked:bg-emerald-600 transition-all"
                        checked={isVetOnly}
                        onChange={(e) => setIsVetOnly(e.target.checked)}
                      />
                      <BadgeCheck className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">Vet-Verified Only</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                        checked={isPregnantOnly}
                        onChange={(e) => setIsPregnantOnly(e.target.checked)}
                      />
                      <Baby className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Pregnant Only</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                        checked={isVaccinatedOnly}
                        onChange={(e) => setIsVaccinatedOnly(e.target.checked)}
                      />
                      <Activity className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Fully Vaccinated</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                        checked={isDewormedOnly}
                        onChange={(e) => setIsDewormedOnly(e.target.checked)}
                      />
                      <CheckDown className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Recently Dewormed</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {filteredListings.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredListings.map((cow) => {
                  const seller = MOCK_USERS.find(u => u.id === cow.seller_id);
                  const avgYield = (cow.milk_yield_last_7_days.reduce((a, b) => a + b, 0) / cow.milk_yield_last_7_days.length).toFixed(1);

                  return (
                    <Link key={cow.id} to={`/listing/${cow.id}`} className={`bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''}`}>
                      <div className={`relative ${viewMode === 'list' ? 'sm:w-64 h-48 sm:h-full' : 'h-52'}`}>
                        <img src={cow.photos[0]} alt={cow.breed} className="w-full h-full object-cover" />
                        {cow.vet_verification.verified && cow.vet_verification.report_url && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold shadow-lg">
                            <BadgeCheck size={12} /> VET VERIFIED
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-xs font-bold border border-white/20">{cow.location}</div>
                      </div>
                      <div className="p-5 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{cow.breed} • {cow.age}Y</h3>
                            <div className="text-right">
                              <p className="text-lg font-extrabold text-slate-900">KSh {cow.price.toLocaleString()}</p>
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <Droplets size={12} className="text-emerald-500" />
                                <span className="text-sm font-black text-emerald-600 tracking-tighter">{avgYield}L AVG</span>
                              </div>
                            </div>
                          </div>
                          {/* Trust Badges */}
                          <div className="flex gap-2 mb-4">
                            {seller?.is_phone_verified && <div className="p-1 bg-blue-100 text-blue-600 rounded" title="Phone Verified"><Smartphone size={12} /></div>}
                            {seller?.is_id_verified && <div className="p-1 bg-indigo-100 text-indigo-600 rounded" title="ID Verified"><ShieldCheck size={12} /></div>}
                            {cow.is_pregnant && <div className="p-1 bg-blue-50 text-blue-500 rounded" title="Pregnant"><Baby size={12} /></div>}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">{cow.seller_name.charAt(0)}</div>
                            <span className="text-xs font-medium text-slate-600">{cow.seller_name}</span>
                          </div>
                          <div className="text-emerald-600 text-xs font-bold uppercase tracking-widest flex items-center gap-1">View Details <ChevronDown size={14} className="-rotate-90" /></div>
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
};

// Helper component for dewormed check icon
const CheckDown = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Marketplace;
