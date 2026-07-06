import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload } from 'react-icons/fi';

/**
 * Popup PDF viewer for the resume.
 *
 * `url` is a blob: URL created from a fetched PDF (see Hero.jsx) — not a
 * direct link to the middleware's /api/resume, because that route
 * requires a bearer token that a plain <iframe src> / <a href> can never
 * send. The blob is fetched once via the same authenticated axios client
 * used everywhere else, then handed to both the inline preview and the
 * download link here.
 */
export default function ResumeModal({ url, onClose }) {
  useEffect(() => {
    if (!url) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [url, onClose]);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full max-w-4xl glass rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Download sits immediately left of Close, both top-right */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-line shrink-0">
              <a
                href={url}
                download="resume.pdf"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink/70 hover:text-accent-mint hover:border-accent-mint transition-colors"
                aria-label="Download resume"
                title="Download"
              >
                <FiDownload size={16} />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink/70 hover:text-red-400 hover:border-red-400 transition-colors"
                aria-label="Close"
                title="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <iframe src={url} title="Resume" className="flex-1 w-full bg-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
