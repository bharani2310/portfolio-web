import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiAlertCircle } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Bundled by Vite and served from our own origin, instead of fetched
// from a CDN at runtime. The previous CDN-hosted worker
// (cdnjs.cloudflare.com/.../pdf.worker.min.mjs) is a very plausible cause
// of "works on desktop, fails on mobile" symptoms: mobile browsers and
// mobile networks are more likely to block/throttle a third-party
// cross-origin script (privacy-focused browsers, some carrier proxies,
// ad-blocker extensions, restrictive CSPs, flaky connections dropping a
// second origin's request) than desktop ones are. Bundling it removes
// that dependency entirely — the worker script is just another asset in
// our own build, so anything that can load the page can load the worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// If PDF.js hasn't finished rendering within this long, something's gone
// wrong in a way that didn't throw a catchable error (seen in the wild on
// some older/locked-down mobile WebViews) — rather than leave the modal
// stuck on a spinner forever, fall back to the direct-download link.
const RENDER_TIMEOUT_MS = 15000;

/**
 * Popup PDF viewer for the resume.
 *
 * Renders every page onto its own <canvas> via PDF.js instead of an
 * <iframe src={blobUrl}>. Plain iframes rely entirely on the browser
 * having a built-in PDF plugin — desktop Chrome/Firefox/Edge do, but most
 * mobile browsers (Chrome/Safari/Samsung Internet on iOS/Android) don't,
 * so on mobile an iframe just shows a blank/black area with a bare
 * download prompt instead of the actual document. Rendering to canvas
 * works identically everywhere since it doesn't depend on any native
 * viewer at all.
 *
 * `url` is a blob: URL created from a fetched PDF (see Hero.jsx) — not a
 * direct link to the middleware's /api/resume, because that route
 * requires a bearer token that a plain <iframe src> can never send. The
 * blob is fetched once via the same authenticated axios client used
 * everywhere else, and PDF.js is handed that same blob URL to render.
 *
 * `downloadUrl`, by contrast, is a *real*, directly-navigable HTTP URL
 * (token passed as a query param) rather than a blob: URL — iOS Safari
 * does not support downloading blob: URLs via the `download` attribute
 * at all (tapping such a link just displays/navigates to the raw blob
 * instead, which looks exactly like a "black screen with an id" — the
 * blob's UUID sitting in the address bar with nothing rendered). A real
 * HTTP response with a Content-Disposition: attachment header (set by
 * the middleware when ?download is present) is honored correctly by
 * every browser, including iOS Safari.
 */
export default function ResumeModal({ url, downloadUrl, onClose }) {
  const containerRef = useRef(null);
  const renderTokenRef = useRef(0);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    if (!url || !containerRef.current) return;

    // Guards against a stale render finishing after the modal has been
    // closed/reopened with a new URL, or the component has unmounted.
    const myToken = ++renderTokenRef.current;
    let cancelled = false;
    const container = containerRef.current;
    container.innerHTML = '';
    setStatus('loading');
    setErrorMessage('');

    const timeoutId = setTimeout(() => {
      if (!cancelled && renderTokenRef.current === myToken) {
        cancelled = true;
        console.error('Resume rendering timed out after', RENDER_TIMEOUT_MS, 'ms');
        setErrorMessage('This is taking longer than expected to preview.');
        setStatus('error');
      }
    }, RENDER_TIMEOUT_MS);

    (async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (cancelled || renderTokenRef.current !== myToken) return;

        // Fit each page's width to the container, rendering at device
        // pixel ratio so it stays crisp on high-DPI mobile screens
        // instead of looking blurry/pixelated when scaled up by CSS.
        const containerWidth = container.clientWidth || 600;
        const dpr = window.devicePixelRatio || 1;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled || renderTokenRef.current !== myToken) return;

          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / baseViewport.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          canvas.className = pageNum > 1 ? 'mt-3' : '';
          container.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
        }

        if (!cancelled && renderTokenRef.current === myToken) {
          clearTimeout(timeoutId);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled && renderTokenRef.current === myToken) {
          clearTimeout(timeoutId);
          console.error('Failed to render resume PDF:', err);
          setErrorMessage(err.message || 'Failed to display the resume.');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [url]);

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
                href={downloadUrl}
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

            <div className="flex-1 overflow-y-auto bg-white/5">
              {status === 'loading' && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-ink/50 py-16">
                  <span className="w-8 h-8 border-2 border-accent-mint/30 border-t-accent-mint rounded-full animate-spin" />
                  <p className="font-mono text-sm">Rendering resume…</p>
                </div>
              )}
              {status === 'error' && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 py-16">
                  <FiAlertCircle className="text-red-400" size={28} />
                  <p className="font-mono text-sm text-red-400">{errorMessage}</p>
                  <a
                    href={downloadUrl}
                    className="text-accent-mint font-mono text-sm underline"
                  >
                    Download it instead
                  </a>
                </div>
              )}
              <div ref={containerRef} className="p-3 md:p-6" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
