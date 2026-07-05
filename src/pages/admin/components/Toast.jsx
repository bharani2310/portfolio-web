import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

/**
 * useToasts — simple toast queue.
 *
 * const toast = useToasts();
 * toast.success('Saved!');
 * toast.error('Something went wrong.');
 *
 * Render <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
 * once, anywhere in the page.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, duration = 4000) => {
    const id = ++idRef.current;
    setToasts((ts) => [...ts, { id, type, message }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return {
    toasts,
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    dismiss,
  };
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-[calc(100%-3rem)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`glass rounded-xl px-4 py-3 flex items-start gap-3 shadow-lg pointer-events-auto ${
              t.type === 'success' ? 'border border-accent-mint/40' : 'border border-red-400/40'
            }`}
          >
            {t.type === 'success' ? (
              <FiCheckCircle className="text-accent-mint shrink-0 mt-0.5" size={18} />
            ) : (
              <FiAlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            )}
            <p className="text-sm text-ink/90 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-ink/40 hover:text-ink shrink-0"
              aria-label="Dismiss"
            >
              <FiX size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}