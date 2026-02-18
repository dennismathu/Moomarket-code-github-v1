import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Camera, Check, Loader2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitFeedback, uploadImage } from '../lib/database';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { user, setMessage } = useAuth();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'bug_report' | 'feature_idea' | 'other'>('bug_report');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset form on close
            setType('bug_report');
            setDescription('');
            setIsAnonymous(false);
            setScreenshot(null);
            setScreenshotPreview(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let screenshot_url = null;
            if (screenshot) {
                const fileName = `feedback/${Date.now()}_${screenshot.name}`;
                const { data, error } = await uploadImage(screenshot, 'cow-photos', fileName);
                if (!error && data) {
                    screenshot_url = data.url;
                }
            }

            const feedbackData = {
                user_id: user ? (isAnonymous ? null : user.id) : null,
                type,
                description,
                is_anonymous: !user || isAnonymous, // Force anonymous if guest
                user_email: user && !isAnonymous ? user.email : null,
                screenshot_url
            };

            const { error } = await submitFeedback(feedbackData);

            if (error) throw error;

            console.log('Feedback submitted successfully, closing modal...');
            onClose(); // Close modal immediately

            setMessage({ text: 'Feedback submitted! Thank you.', type: 'success' });

            // Reset form for next time (though it should reset on mount/unmount too)
            setDescription('');
            setScreenshot(null);
            setScreenshotPreview(null);
        } catch (error: any) {
            console.error('Feedback submission error:', error);
            setMessage({ text: 'Failed to submit feedback. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Send Feedback</h2>
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                                <MessageSquare size={14} /> We value your input
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Feedback Type */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'bug_report', label: 'Bug', icon: Bug, color: 'text-red-500' },
                                { id: 'feature_idea', label: 'Idea', icon: Lightbulb, color: 'text-amber-500' },
                                { id: 'other', label: 'Other', icon: MessageSquare, color: 'text-blue-500' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setType(opt.id as any)}
                                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${type === opt.id
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <opt.icon size={18} className={type === opt.id ? 'text-white' : opt.color} />
                                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Details
                            </label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell us more..."
                                className="w-full h-28 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all text-sm resize-none"
                            />
                        </div>

                        {/* Screenshot (Optional) */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Screenshot (Optional)
                            </label>
                            <div className="relative">
                                {screenshotPreview ? (
                                    <div className="relative w-full h-28 rounded-2xl overflow-hidden border-2 border-slate-100">
                                        <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-red-500 shadow-sm"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                                        <Camera className="text-slate-300 mb-1" size={20} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Click to upload</span>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Anonymous Toggle - Only show if logged in */}
                        {user && (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900">Report Anonymously</p>
                                        <p className="text-[10px] font-bold text-slate-400">By default we include your email</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isAnonymous ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnonymous ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    Submit Feedback <Check size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
