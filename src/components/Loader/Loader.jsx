import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Loader({ name = 'Portfolio' }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-5xl font-bold tracking-tight"
          >
            <span className="text-ink">&lt;</span>
            <span className="gradient-text">{name}</span>
            <span className="text-ink">/&gt;</span>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '180px' }}
            transition={{ duration: 1.3, ease: 'easeInOut' }}
            className="h-[2px] bg-gradient-to-r from-accent-violet to-accent-mint mt-6"
          />
          <p className="font-mono text-xs text-ink/50 mt-4 cursor-blink">loading portfolio</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
