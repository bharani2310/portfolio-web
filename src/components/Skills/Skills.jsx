import { motion } from 'framer-motion';
import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';
import Reveal from '../Reveal';

export default function Skills() {
  const { data, loading } = usePortfolio();
  const categories = data?.skills || [];

  return (
    <section id="skills" className="section-pad">
      <Reveal>
        <p className="eyebrow mb-3">Skills</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-12">
          What I <span className="gradient-text">Work With</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && [1,2,3].map(i => <div key={i} className="h-56 glass rounded-2xl animate-pulse" />)}
        {categories.map((cat, idx) => (
          <Reveal key={cat._id || cat.category} delay={idx * 0.1}>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
              className="glass rounded-2xl p-6 h-full"
            >
              <h3 className="font-display font-semibold text-lg mb-5">{cat.category}</h3>
              <div className="space-y-4">
                {(cat.items || []).map(item => {
                  const name = typeof item === 'string' ? item : item.name;
                  const level = typeof item === 'string' ? 80 : item.level || 80;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-ink/80 font-mono">{name}</span>
                        <span className="text-ink/40 font-mono text-xs">{level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-line overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${level}%` }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-accent-violet to-accent-mint rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
