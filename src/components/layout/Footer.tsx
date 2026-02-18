import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../FeedbackModal';

const Footer: React.FC = () => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                        <span className="text-xl font-bold text-white tracking-tight">MooMarket.ke</span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        Building trust in the Kenyan dairy industry. Every cow verified, every seller vetted.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/listings" className="hover:text-emerald-400">Browse Cows</Link></li>
                        <li><Link to="/seller/new-listing" className="hover:text-emerald-400">List Your Cow</Link></li>
                        <li><a href="/#how-it-works" className="hover:text-emerald-400">How It Works</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/#faq" className="hover:text-emerald-400">FAQs</a></li>
                        <li><Link to="/contact" className="hover:text-emerald-400">Contact Us</Link></li>
                        <li><button onClick={() => setIsFeedbackOpen(true)} className="hover:text-emerald-400 text-left">Give Feedback</button></li>
                        <li><Link to="/terms" className="hover:text-emerald-400">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-4">Our Vision</h4>
                    <p className="text-xs italic leading-loose">
                        "Empowering small-scale dairy farmers with technology to reach broader markets safely."
                    </p>
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mb-1">Powered by</p>
                        <p className="text-sm text-white font-bold">Made Social Solutions</p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
                &copy; 2026 MooMarket Kenya. All rights reserved.
            </div>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </footer>
    );
};

export default Footer;
