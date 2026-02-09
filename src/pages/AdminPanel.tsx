import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, FileText, ExternalLink, AlertTriangle, Eye, Users, TrendingUp, MapPin, Loader2, BarChart3, Trash2 } from 'lucide-react';
import { getAllListingsForAdmin, updateListingStatus, getAdminMetrics, deleteListing } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel: React.FC = () => {
  const { setMessage } = useAuth();
  const [activeTab, setActiveTab] = useState<'moderation' | 'metrics'>('moderation');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [listingsRes, metricsRes] = await Promise.all([
      getAllListingsForAdmin(),
      getAdminMetrics()
    ]);

    if (!listingsRes.error) setListings(listingsRes.data || []);
    if (!metricsRes.error) setMetrics(metricsRes.data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await updateListingStatus(id, status);
    if (!error) {
      setMessage({ text: `Listing ${status} successfully`, type: 'success' });
      fetchData();
    } else {
      setMessage({ text: 'Failed to update status', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    const { error } = await deleteListing(id);
    if (!error) {
      setMessage({ text: 'Listing deleted successfully', type: 'success' });
      fetchData();
    } else {
      setMessage({ text: 'Failed to delete listing', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-slate-900 mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Admin Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Control</h1>
            <p className="text-slate-500 font-medium">Platform Management & Verification</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'moderation' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Moderation
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'metrics' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Platform Metrics
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Total Listings', value: metrics?.totalListings, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Users', value: metrics?.totalUsers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg Views/Listing', value: (metrics?.totalListings ? (metrics.mostViewedListings.reduce((a: any, b: any) => a + b.view_count, 0) / 5).toFixed(0) : 0), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Platform Growth', value: '+12%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Breeds */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-600" /> Top Breeds
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">By Views</span>
                </div>
                <div className="p-6 space-y-4">
                  {metrics?.topBreeds.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-4 flex-1 max-w-[120px] ml-4">
                        <div className="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(item.value / metrics.topBreeds[0].value) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Locations */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" /> High Activity Areas
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">County Views</span>
                </div>
                <div className="p-6 space-y-4">
                  {metrics?.topLocations.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-4 flex-1 max-w-[120px] ml-4">
                        <div className="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(item.value / metrics.topLocations[0].value) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-900 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Viewed Listings */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Eye size={18} className="text-purple-600" /> Hot Listings
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Top 5</span>
                </div>
                <div className="p-6 space-y-4">
                  {metrics?.mostViewedListings.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => window.open(`/listing/${item.id}`, '_blank')}>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase">{item.breed}</p>
                        <p className="text-[10px] text-slate-400 font-bold">KSh {item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{item.view_count}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Listing</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Farmer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status/Vet</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listings.map(cow => (
                      <tr key={cow.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                              {cow.media?.[0]?.media_url ? (
                                <img src={cow.media[0].media_url} className="w-full h-full object-cover" />
                              ) : (
                                <BarChart3 className="w-full h-full p-3 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{cow.breed}</p>
                              <p className="text-xs text-slate-400 tracking-tight">KSh {cow.price.toLocaleString()} • {cow.county}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm font-medium text-slate-700">{cow.seller?.full_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cow.seller?.email}</div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cow.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                              cow.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-100' :
                                'text-amber-600 bg-amber-50 border-amber-100'
                              }`}>
                              {cow.status.toUpperCase()}
                            </span>
                            {cow.vet?.[0]?.is_verified ? (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                <CheckCircle size={10} /> DOCUMENTED
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <AlertTriangle size={10} /> NO VET REPORT
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            {cow.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(cow.id, 'approved')}
                                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {cow.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(cow.id, 'rejected')}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => window.open(`/listing/${cow.id}`, '_blank')}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                              title="View Public Detail"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(cow.id)}
                              className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {listings.map(cow => (
                <div key={cow.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        {cow.media?.[0]?.media_url ? (
                          <img src={cow.media[0].media_url} className="w-full h-full object-cover" />
                        ) : (
                          <BarChart3 className="w-full h-full p-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg uppercase leading-tight">{cow.breed}</p>
                        <p className="text-xs font-bold text-emerald-600 tracking-tight">KSh {cow.price.toLocaleString()} • {cow.county}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cow.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                        cow.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-100' :
                          'text-amber-600 bg-amber-50 border-amber-100'
                        }`}>
                        {cow.status.toUpperCase()}
                      </span>
                      {cow.vet?.[0]?.is_verified && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                          <CheckCircle size={10} /> DOCUMENTED
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmer</p>
                      <p className="text-xs font-bold text-slate-700">{cow.seller?.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                      <p className="text-xs text-slate-500 truncate max-w-[140px]">{cow.seller?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {cow.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(cow.id, 'approved')}
                        className="flex-1 min-w-[120px] py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    )}
                    {cow.status !== 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(cow.id, 'rejected')}
                        className="flex-1 min-w-[120px] py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    )}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => window.open(`/listing/${cow.id}`, '_blank')}
                        className="flex-1 sm:flex-none p-3 bg-white border border-slate-200 text-slate-600 rounded-xl transition-colors active:bg-slate-50 flex items-center justify-center"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cow.id)}
                        className="flex-1 sm:flex-none p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl transition-colors active:bg-red-100 flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {listings.length === 0 && (
              <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center text-slate-400 font-medium">
                No listings found to moderate.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
