import { useState } from 'react';
import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';
import Reveal from '../Reveal';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function Projects() {
  const { data, loading } = usePortfolio();
  const items = data?.projects || [];
  const [active, setActive] = useState(null);

  return (
    <section id="projects" className="section-pad">
      <Reveal>
        <p className="eyebrow mb-3">Projects</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-12">
          Things I&apos;ve <span className="gradient-text">Built</span>
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && [1,2,3].map(i => <div key={i} className="h-80 glass rounded-2xl animate-pulse" />)}
        {items.map((project, idx) => (
          <ProjectCard key={project._id || idx} project={project} index={idx} onDetails={setActive} />
        ))}
      </div>
      {!loading && items.length === 0 && (
        <p className="text-ink/50 font-mono text-sm">No projects published yet.</p>
      )}
      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}
