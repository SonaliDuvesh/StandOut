import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Check, Copy, ExternalLink, Globe, Sparkles, X, RefreshCw
} from 'lucide-react';

const PublishModal = ({
    isOpen,
    onClose,
    publishResult,
    isUpdate = false,
}) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !publishResult) return null;

    const {
        slug,
        shortUrl,
        fullUrl,
    } = publishResult;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const activeUrl = shortUrl || `${origin}/p/${slug}` || fullUrl;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy to clipboard', err);
        }
    };

    const handleOpenLive = () => {
        window.open(activeUrl, '_blank', 'noopener,noreferrer');
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-lg glass bg-white/95 dark:bg-navy-900/95 border border-soft-cream-300 dark:border-navy-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up text-navy-900 dark:text-soft-cream-50"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-navy-400 hover:text-navy-700 dark:hover:text-soft-cream-200 hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        {isUpdate ? <RefreshCw className="w-6 h-6 animate-spin-once" /> : <Globe className="w-6 h-6" />}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-700/60 mb-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{isUpdate ? 'Portfolio Updated' : 'Live Portfolio Published'}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black">
                            {isUpdate ? 'Portfolio Updated!' : 'Your Portfolio is Live!'}
                        </h2>
                        <p className="text-xs sm:text-sm text-navy-600 dark:text-soft-cream-300 mt-1">
                            Your personalized portfolio link is ready to share anywhere.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-navy-600 dark:text-soft-cream-400">
                        Shareable Link
                    </label>
                    <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-soft-cream-100 dark:bg-navy-950/80 border border-soft-cream-300 dark:border-navy-800">
                        <div className="flex-1 font-mono text-xs sm:text-sm text-navy-800 dark:text-soft-cream-200 px-2 truncate select-all">
                            {activeUrl}
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                                copied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-navy-800 hover:bg-navy-900 text-white dark:bg-soft-cream-200 dark:text-navy-950 dark:hover:bg-soft-cream-100 hover:scale-105 active:scale-95'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleOpenLive}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-golden-500 to-amber-600 hover:from-amber-600 hover:to-golden-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Live Portfolio</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3 px-5 rounded-xl btn-secondary text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default PublishModal;
