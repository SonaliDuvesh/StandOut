import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    History, Clock, RotateCcw, Sparkles, Bookmark, Check,
    Trash2, X, ShieldCheck, AlertCircle, ArrowRight, Calendar,
    FolderGit2, Cpu, Award, Palette, Home, Layers
} from 'lucide-react';

const SECTION_ICONS = {
    home: Home,
    projects: FolderGit2,
    skills: Cpu,
    certifications: Award,
    appearance: Palette,
};

const SessionHistoryModal = ({
    isOpen,
    onClose,
    snapshots = [],
    onRestoreSnapshot,
    onRestoreLatest,
    onSaveManualCheckpoint,
    onClearHistory,
}) => {
    const [manualLabel, setManualLabel] = useState('');
    const [savingManual, setSavingManual] = useState(false);
    const [restoredId, setRestoredId] = useState(null);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    if (!isOpen) return null;

    const handleManualSave = (e) => {
        e.preventDefault();
        setSavingManual(true);
        onSaveManualCheckpoint(manualLabel.trim() || undefined);
        setManualLabel('');
        setTimeout(() => setSavingManual(false), 500);
    };

    const handleRestore = (snapshot) => {
        setRestoredId(snapshot.id);
        onRestoreSnapshot(snapshot);
        setTimeout(() => {
            setRestoredId(null);
            onClose();
        }, 400);
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-2xl max-h-[85vh] flex flex-col glass bg-white/95 dark:bg-navy-900/95 border border-soft-cream-300 dark:border-navy-700 rounded-3xl p-6 sm:p-7 shadow-2xl animate-scale-up text-navy-900 dark:text-soft-cream-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-soft-cream-200 dark:border-navy-800">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-golden-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/60 mb-0.5">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Browser Storage Session Guard</span>
                            </div>
                            <h2 className="text-xl font-black">
                                Session History & Restore
                            </h2>
                            <p className="text-xs text-navy-600 dark:text-soft-cream-400">
                                Continuous auto-saves preserve your edits so you never lose accidental changes.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-navy-400 hover:text-navy-700 dark:hover:text-soft-cream-200 hover:bg-soft-cream-200 dark:hover:bg-navy-800 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Quick Save Checkpoint Form */}
                <div className="py-3 px-4 my-3 rounded-2xl bg-soft-cream-100 dark:bg-navy-950/70 border border-soft-cream-300 dark:border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleManualSave} className="flex-1 flex items-center gap-2 w-full">
                        <input
                            type="text"
                            value={manualLabel}
                            onChange={(e) => setManualLabel(e.target.value)}
                            placeholder="Label a progress checkpoint (e.g. 'Before reorganizing projects')"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-navy-900 border border-soft-cream-300 dark:border-navy-700 text-navy-900 dark:text-soft-cream-100 placeholder-navy-400 dark:placeholder-soft-cream-500 focus:outline-none focus:ring-1 focus:ring-golden-500"
                        />
                        <button
                            type="submit"
                            disabled={savingManual}
                            className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 bg-golden-500/10 text-golden-700 dark:text-golden-400 hover:bg-golden-500/20 border-golden-400/30 cursor-pointer"
                            title="Bookmark current portfolio state"
                        >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save Point</span>
                        </button>
                    </form>

                    {snapshots.length > 0 && onRestoreLatest && (
                        <button
                            type="button"
                            onClick={() => handleRestore(snapshots[0])}
                            className="btn-primary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer w-full sm:w-auto justify-center"
                            title="Restore most recent auto-save"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore Latest</span>
                        </button>
                    )}
                </div>

                {/* Snapshots Timeline List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
                    {snapshots.length === 0 ? (
                        <div className="py-12 px-4 text-center space-y-2">
                            <Clock className="w-10 h-10 mx-auto text-navy-300 dark:text-soft-cream-600 animate-pulse" />
                            <p className="text-sm font-semibold text-navy-700 dark:text-soft-cream-200">
                                No session checkpoints recorded yet
                            </p>
                            <p className="text-xs text-navy-500 dark:text-soft-cream-400 max-w-sm mx-auto">
                                Checkpoints are saved automatically as you work and edit in the studio. You can also click "Save Point" above anytime.
                            </p>
                        </div>
                    ) : (
                        snapshots.map((snap, index) => {
                            const SectionIcon = (snap.activeSection && SECTION_ICONS[snap.activeSection]) || Layers;
                            const isRestored = restoredId === snap.id;
                            const isLatest = index === 0;

                            return (
                                <div
                                    key={snap.id}
                                    className={`group p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                        isLatest
                                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-700/60 shadow-xs'
                                            : 'bg-white/60 dark:bg-navy-950/40 border-soft-cream-200 dark:border-navy-800/80 hover:border-golden-400/50'
                                    }`}
                                >
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs font-bold text-navy-900 dark:text-soft-cream-100 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-golden-500" />
                                                <span>{snap.timeStr || new Date(snap.timestamp).toLocaleTimeString()}</span>
                                            </span>
                                            {isLatest && (
                                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-white tracking-wider">
                                                    Most Recent
                                                </span>
                                            )}
                                            {snap.type === 'manual' && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/50">
                                                    Manual Bookmark
                                                </span>
                                            )}
                                            {snap.activeSection && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-soft-cream-200 dark:bg-navy-800 text-navy-600 dark:text-soft-cream-300 inline-flex items-center gap-1 capitalize">
                                                    <SectionIcon className="w-3 h-3" />
                                                    <span>{snap.activeSection}</span>
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs font-medium text-navy-800 dark:text-soft-cream-200 truncate">
                                            {snap.label}
                                        </p>

                                        {snap.summary && (
                                            <p className="text-[11px] text-navy-500 dark:text-soft-cream-400 truncate">
                                                {snap.summary}
                                            </p>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRestore(snap)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                                isRestored
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white hover:scale-105 active:scale-95'
                                            }`}
                                            title="Restore portfolio to this state"
                                        >
                                            {isRestored ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Restored!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                    <span>Restore</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-soft-cream-200 dark:border-navy-800 flex items-center justify-between text-xs text-navy-500 dark:text-soft-cream-400">
                    <span className="text-[11px]">
                        {snapshots.length} saved checkpoint{snapshots.length === 1 ? '' : 's'} stored in browser storage
                    </span>

                    {snapshots.length > 0 && (
                        showConfirmClear ? (
                            <div className="flex items-center gap-2">
                                <span className="text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                                    Clear all checkpoints?
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClearHistory?.();
                                        setShowConfirmClear(false);
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                    Yes, Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmClear(false)}
                                    className="px-2 py-0.5 rounded-md bg-soft-cream-200 dark:bg-navy-800 text-[11px] cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowConfirmClear(true)}
                                className="inline-flex items-center gap-1 text-[11px] text-navy-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                                <span>Clear History</span>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default SessionHistoryModal;

