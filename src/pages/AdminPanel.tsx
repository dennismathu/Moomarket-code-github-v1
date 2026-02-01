
import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, FileText, ExternalLink, AlertTriangle, Eye } from 'lucide-react';
import { MOCK_LISTINGS } from '../data/mockData';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports'>('pending');

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
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Pending Listings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600'}`}
          >
            Vet Reports
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Listing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Farmer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LISTINGS.map(cow => (
                <tr key={cow.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <img src={cow.photos[0]} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{cow.breed}</p>
                        <p className="text-xs text-slate-400 tracking-tight">KSh {cow.price.toLocaleString()} • {cow.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-medium text-slate-700">{cow.seller_name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cow.seller_farm}</div>
                  </td>
                  <td className="px-6 py-6">
                    {cow.vet_verification.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <CheckCircle size={14} /> DOCUMENTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <AlertTriangle size={14} /> PENDING REVIEW
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Reject">
                        <XCircle size={18} />
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="View Detail">
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {MOCK_LISTINGS.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
              No listings to review currently.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
