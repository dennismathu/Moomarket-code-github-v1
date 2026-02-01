
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Video, MessageSquare, Truck, ArrowRight, CheckCircle2, Star, Search, UserPlus, FileSearch, Handshake } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 scroll-smooth">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 mb-6">
                Direct from verified farmers
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6 leading-tight">
                Buy verified dairy cows <br />
                <span className="text-emerald-600">with confidence.</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                We bridge the trust gap in Kenya's livestock market. 
                Every listing includes vet-checked health reports, real videos, 
                and transparent history from genuine farmers.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Link to="/listings" className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1">
                  Browse verified cows
                </Link>
                <Link to="/seller/onboarding" className="inline-flex items-center justify-center px-6 py-4 border-2 border-slate-200 text-base font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all transform hover:-translate-y-1">
                  Sell your cow
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 justify-center lg:justify-start">
                 <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-600" /> 100% Vetted</div>
                 <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-600" /> Secure Messages</div>
                 <div className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-600" /> Vet Verified</div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-3xl shadow-2xl overflow-hidden border-8 border-white">
                <img
                  className="w-full h-full object-cover aspect-[4/3]"
                  src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800"
                  alt="Healthy Friesian dairy cow"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Top Verified Seller</p>
                      <p className="font-bold text-slate-900">Samuel's Green Farm, Kiambu</p>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">V</div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">5+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (Moved right under hero) */}
      <section className="bg-slate-50 py-12 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900 mb-1">200+</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Verified Cows</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900 mb-1">50+</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Vet Clinics</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900 mb-1">12+</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Counties</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-slate-900 mb-1">100%</p>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Trust Score</p>
          </div>
        </div>
      </section>

      {/* Trust Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Trust is our Priority</h2>
            <p className="mt-4 text-xl text-slate-500">We verify what others assume.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Vet Verification</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Sellers must upload signed reports from registered clinics. We manually check every document before a cow goes live.
              </p>
              <Link to="/listings" className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Browse verified <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Video size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Video Proof</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Photos can hide issues. We require a 30-second video of the cow walking and a milking clip for active lactations.
              </p>
              <Link to="/listings" className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                See cows in action <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct Communication</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Message sellers directly through our platform. No hidden brokers, no interference. You decide who to deal with.
              </p>
              <Link to="/listings" className="text-emerald-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Talk to farmers <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">Transparency first</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">How MooMarket Works</h2>
            <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto">Connecting buyers and sellers through a simple, trust-driven process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector Line (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 bg-white p-8 rounded-3xl text-center flex flex-col items-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Browse & Filter</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Search by breed, milk yield, and location to find the perfect cow for your farm.</p>
            </div>

            <div className="relative z-10 bg-white p-8 rounded-3xl text-center flex flex-col items-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <FileSearch size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">2. Review Verification</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Check vet-signed health reports and watch real videos of the cow in action.</p>
            </div>

            <div className="relative z-10 bg-white p-8 rounded-3xl text-center flex flex-col items-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Message & Inspect</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Contact the farmer directly and schedule a physical inspection to verify the health.</p>
            </div>

            <div className="relative z-10 bg-white p-8 rounded-3xl text-center flex flex-col items-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                <Handshake size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">4. Safe Handover</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Complete the transaction with peace of mind knowing the animal's history.</p>
            </div>
          </div>

          <div className="mt-20 p-12 bg-emerald-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Start browsing our verified dairy herd today</h3>
               <Link to="/listings" className="inline-flex items-center justify-center px-12 py-5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-950/20 active:scale-95">
                  Browse Verified Cows
               </Link>
             </div>
             {/* Abstract background cow shape or pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Coming Soon Teaser */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
            <div className="px-8 py-16 md:p-16 relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left">
                <span className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
                  Coming Soon
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Professional Delivery & <br className="hidden md:block" /> Safe Transport
                </h2>
                <p className="text-slate-400 text-lg mb-8 max-w-xl leading-relaxed">
                  Soon, buyers will be able to request safe, animal-friendly transport directly through the platform. 
                  Verified transporters only. Stress-free delivery for your livestock.
                </p>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Real-time tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Insurance included</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Vet-approved vehicles</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-emerald-600/10 p-4 rounded-full border border-emerald-500/20 animate-pulse">
                  <div className="w-48 h-48 md:w-64 md:h-64 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <Truck size={80} className="md:size-[100px]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-900/10 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Ready to grow your dairy farm?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/listings" className="px-10 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg">
              Explore Listings
            </Link>
            <Link to="/seller/onboarding" className="px-10 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors border border-emerald-500">
              List Your Farm
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
          </svg>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
