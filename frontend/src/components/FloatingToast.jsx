import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const FloatingToast = ({ successMessage, errorMessage, onClearSuccess, onClearError }) => {
    const [current, setCurrent] = useState(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isEntered, setIsEntered] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (successMessage) {
            clearTimeout(timerRef.current);
            setCurrent({ message: successMessage, type: 'success' });
            setIsExiting(false);
            setIsEntered(false);

            const animFrame = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsEntered(true);
                });
            });

            timerRef.current = setTimeout(() => {
                triggerExit('success');
            }, 3000);

            return () => cancelAnimationFrame(animFrame);
        } else if (errorMessage) {
            clearTimeout(timerRef.current);
            setCurrent({ message: errorMessage, type: 'error' });
            setIsExiting(false);
            setIsEntered(false);

            const animFrame = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsEntered(true);
                });
            });

            timerRef.current = setTimeout(() => {
                triggerExit('error');
            }, 3500);

            return () => cancelAnimationFrame(animFrame);
        }
    }, [successMessage, errorMessage]);

    const triggerExit = (typeToClear) => {
        setIsExiting(true);
        setTimeout(() => {
            setCurrent(null);
            setIsEntered(false);
            setIsExiting(false);
            if (typeToClear === 'success') onClearSuccess?.();
            if (typeToClear === 'error') onClearError?.();
        }, 300);
    };

    const handleDismiss = () => {
        clearTimeout(timerRef.current);
        triggerExit(current?.type);
    };

    if (!current) return null;

    const isSuccess = current.type === 'success';

    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto transition-all duration-300 ease-out transform ${
                isExiting
                    ? 'opacity-0 -translate-y-5 scale-95 pointer-events-none'
                    : isEntered
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 -translate-y-4 scale-95'
            }`}
        >
            <div
                className={`flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-xs sm:text-sm font-semibold select-none ${
                    isSuccess
                        ? 'bg-emerald-600/95 text-white border-emerald-400/40 shadow-emerald-950/30 ring-1 ring-emerald-300/30'
                        : 'bg-rose-600/95 text-white border-rose-400/40 shadow-rose-950/30 ring-1 ring-rose-300/30'
                }`}
                role="status"
                aria-live="polite"
            >
                {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
                )}
                <span className="leading-tight">{current.message}</span>
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="ml-2 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Dismiss notification"
                    aria-label="Dismiss"
                >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </div>
    );
};

export default FloatingToast;
