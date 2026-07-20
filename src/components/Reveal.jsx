import { motion } from 'framer-motion';

/**
 * Reveal - wraps any section content so it animates in like a
 * presentation slide: fade + slide up from 100px, triggered once
 * when it enters the viewport.
 *
 * `eager` — for above-the-fold content (e.g. the Hero section) that
 * should animate in immediately on page load rather than waiting for
 * an intersection-observer "scrolled into view" trigger. Without this,
 * content sitting near the bottom of a tall first viewport (common on
 * mobile) stays at opacity:0 — invisible — until the user scrolls,
 * since whileInView only fires once the observer's threshold is met.
 */
export default function Reveal({ children, delay = 0, y = 80, className = '', eager = false }) {
  const motionProps = eager
    ? { animate: { opacity: 1, y: 0 } }
    : {
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: false, amount: 0.15, margin: '0px 0px -10% 0px' },
      };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...motionProps}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
