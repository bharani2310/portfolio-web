import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';
import Reveal from '../Reveal';

export default function About() {
  const { data, loading } = usePortfolio();
  const profile = data?.profile;

  return (
    <section id="about" className="section-pad">
      <Reveal>
        <p className="eyebrow mb-3">About</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-10">
          My <span className="gradient-text">Story</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <Reveal delay={0.1} className="md:col-span-2">
          <p className="text-ink/70 leading-relaxed">
            {loading ? 'Loading...' : profile?.professionalSummary || profile?.description || '—'}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="glass rounded-2xl p-6 space-y-4">
            {[
              ['Current Role', profile?.currentCompany || profile?.role],
              ['Based In', profile?.location],
              ['Focus', profile?.role],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="eyebrow mb-1">{label}</p>
                <p className="font-mono text-sm text-ink/80">{value || '—'}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
