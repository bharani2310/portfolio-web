import { motion } from 'framer-motion';

/**
 * Reveal - wraps any section content so it animates in like a
 * presentation slide: fade + slide up from 100px, triggered once
 * when it enters the viewport.
 */
export default function Reveal({ children, delay = 0, y = 80, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
