import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const floaters = [
  { top: '18%', left: '12%', size: 10, delay: 0 },
  { top: '30%', left: '85%', size: 14, delay: 0.6 },
  { top: '68%', left: '8%', size: 8, delay: 1.1 },
  { top: '78%', left: '80%', size: 12, delay: 0.3 },
  { top: '12%', left: '55%', size: 6, delay: 1.6 },
];

export default function NotFound() {
  return (
    <section
        className="relative flex items-center justify-center overflow-hidden px-6 md:px-12"
        style={{ minHeight: '110dvh' }}
        >
      {/* ambient glow, matches Hero */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-accent-violet/20 to-accent-mint/20 blur-3xl" />
      </div>

      {/* floating stars/particles */}
      {floaters.map((f, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-accent-mint/60"
          style={{ top: f.top, left: f.left, width: f.size, height: f.size }}
          animate={{ y: [0, -14, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
        />
      ))}

      <div className="relative w-full max-w-xl flex flex-col items-center text-center">

        {/* the character */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mb-1"
            >
            <motion.div
                animate={{ y: [12, -4, 12], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* antenna */}
              <motion.line
                x1="110" y1="30" x2="110" y2="10"
                stroke="rgb(var(--line))" strokeWidth="3" strokeLinecap="round"
              />
              <motion.circle
                cx="110" cy="8" r="6"
                fill="#45E0C4"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* body */}
              <rect x="45" y="30" width="130" height="120" rx="28" fill="rgb(var(--surface))" stroke="rgb(var(--line))" strokeWidth="2" />

              {/* screen/face plate */}
              <rect x="62" y="52" width="96" height="62" rx="16" fill="#7C5CFC" fillOpacity="0.12" stroke="#7C5CFC" strokeOpacity="0.4" strokeWidth="1.5" />

              {/* eyes */}
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.85, 0.9, 0.95, 1], ease: 'easeInOut' }}
                style={{ transformOrigin: '110px 82px' }}
              >
                <circle cx="88" cy="82" r="8" fill="#45E0C4" />
                <circle cx="132" cy="82" r="8" fill="#45E0C4" />
              </motion.g>

              {/* confused mouth */}
              <path d="M96 100 Q110 92 124 100" stroke="#45E0C4" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* arms */}
              <motion.line
                x1="45" y1="80" x2="20" y2="65"
                stroke="rgb(var(--line))" strokeWidth="6" strokeLinecap="round"
                animate={{ rotate: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '45px 80px' }}
              />
              <motion.line
                x1="175" y1="80" x2="200" y2="65"
                stroke="rgb(var(--line))" strokeWidth="6" strokeLinecap="round"
                animate={{ rotate: [0, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                style={{ transformOrigin: '175px 80px' }}
              />

              {/* legs */}
              <line x1="80" y1="150" x2="76" y2="178" stroke="rgb(var(--line))" strokeWidth="6" strokeLinecap="round" />
              <line x1="140" y1="150" x2="144" y2="178" stroke="rgb(var(--line))" strokeWidth="6" strokeLinecap="round" />

              {/* "404" badge on chest, glitching in */}
              <motion.text
                x="110" y="135"
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="14"
                fontWeight="700"
                fill="#7C5CFC"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                404
              </motion.text>
            </svg>
          </motion.div>

          {/* shadow */}
          <motion.div
            className="mx-auto mt-2 h-3 w-24 rounded-full bg-black/30 blur-md"
            animate={{ scaleX: [1, 0.8, 1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display font-extrabold text-5xl md:text-7xl mb-3 gradient-text"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-lg md:text-xl text-ink/80 mb-2"
        >
          Beep boop&mdash; this page doesn&apos;t compute.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-violet text-white font-mono text-sm font-medium hover:bg-accent-violet/90 transition-colors"
          >
            <FiHome /> Back to home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass font-mono text-sm font-medium text-ink hover:border-accent-mint/60 transition-colors"
          >
            <FiArrowLeft /> Go back
          </button>
        </motion.div>
      </div>
    </section>
  );
}