import React, { useEffect } from 'react';
import { X, Copy, Mail, MessageCircle, Facebook, Twitter, Smartphone, ExternalLink, Check } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareData: {
        title: string;
        text: string;
        url: string;
        image?: string;
    };
    onShareTrack: (platform: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareData, onShareTrack }) => {
    const [copied, setCopied] = React.useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setCopied(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    const encodedTitle = encodeURIComponent(shareData.title);

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366]',
            link: `https://wa.me/?text=${encodedText}`,
            platform: 'whatsapp'
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#1877F2]',
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            platform: 'facebook'
        },
        {
            name: 'X (Twitter)',
            icon: Twitter,
            color: 'bg-[#000000]',
            link: `https://twitter.com/intent/tweet?text=${encodedText}`,
            platform: 'x'
        },
        {
            name: 'TikTok',
            icon: Smartphone,
            color: 'bg-[#000000]',
            link: `https://www.tiktok.com/`, // TikTok doesn't have a direct share URL like others
            platform: 'tiktok',
            isTikTok: true
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'bg-slate-600',
            link: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
            platform: 'email'
        }
    ];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareData.url);
            setCopied(true);
            onShareTrack('copy');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleShareClick = (option: typeof shareOptions[0]) => {
        if (option.isTikTok) {
            handleCopyLink();
            alert('Link copied! Paste it in your TikTok description or bio. Opening TikTok...');
            onShareTrack('tiktok');
            window.open(option.link, '_blank');
        } else {
            onShareTrack(option.platform);
            window.open(option.link, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Share Listing</h2>
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                                <ExternalLink size={14} /> Help a farmer out
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {shareOptions.map((option) => (
                            <button
                                key={option.name}
                                onClick={() => handleShareClick(option)}
                                className="flex flex-col items-center group gap-2.5"
                            >
                                <div className={`w-14 h-14 ${option.color} text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 group-active:scale-95 transition-all`}>
                                    <option.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{option.name}</span>
                            </button>
                        ))}

                        <button
                            onClick={handleCopyLink}
                            className="flex flex-col items-center group gap-2.5"
                        >
                            <div className={`w-14 h-14 ${copied ? 'bg-emerald-500' : 'bg-slate-100'} ${copied ? 'text-white' : 'text-slate-600'} rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 group-active:scale-95 transition-all`}>
                                {copied ? <Check size={24} /> : <Copy size={24} />}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {copied ? 'Copied' : 'Copy Link'}
                            </span>
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 overflow-hidden flex-shrink-0">
                                {shareData.image ? (
                                    <img src={shareData.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <Smartphone size={18} />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate uppercase">{shareData.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">{shareData.url}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {copied && (
                    <div className="bg-emerald-500 text-white text-center py-2 text-[10px] font-bold uppercase tracking-widest animate-in slide-in-from-bottom-full mt-auto">
                        Link copied to clipboard!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
