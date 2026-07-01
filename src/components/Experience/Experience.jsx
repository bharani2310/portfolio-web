import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';
import Reveal from '../Reveal';
import { sortExperienceLatestFirst } from '../../utils/experienceSort';

function formatMonthYear(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function calcDuration(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) months = 1;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

export default function Experience() {
  const { data, loading } = usePortfolio();
  const items = sortExperienceLatestFirst(data?.experience || []);

  return (
    <section id="experience" className="section-pad">
      <Reveal>
        <p className="eyebrow mb-3">Experience</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-12">
          Where I&apos;ve <span className="gradient-text">Worked</span>
        </h2>
      </Reveal>

      <div className="space-y-8 max-w-3xl">
        {loading && [1,2].map(i => <div key={i} className="h-32 glass rounded-2xl animate-pulse" />)}

        {items.map((item, idx) => (
          <Reveal key={item._id || idx} delay={idx * 0.1}>
            <div className="glass rounded-2xl p-6">
              {/* Company header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-line">
                <h3 className="font-display font-bold text-xl">{item.companyName}</h3>
                {item.technologies?.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 justify-end">
                    {item.technologies.map(t => (
                      <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full border border-line text-ink/50">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles timeline within the company */}
              <div>
                {(item.roles || []).map((role, rIdx, arr) => (
                  <div key={rIdx} className="flex gap-4">
                    {/* Timeline rail: dot + connecting line share one centered column,
                        so the line always terminates exactly at the dot's center. */}
                    <div className="relative flex flex-col items-center w-3 shrink-0">
                      <span className="w-3 h-3 rounded-full border-2 border-accent-mint bg-bg shrink-0 mt-1.5 z-10" />
                      {rIdx < arr.length - 1 && (
                        <span className="w-px flex-1 bg-gradient-to-b from-accent-violet to-accent-mint" />
                      )}
                    </div>

                    <div className={rIdx < arr.length - 1 ? 'flex-1 pb-6' : 'flex-1'}>
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <span className="font-display font-semibold">{role.role}</span>
                        <span className="font-mono text-xs text-accent-mint">
                          {formatMonthYear(role.startDate)} — {formatMonthYear(role.endDate)}
                        </span>
                        <span className="font-mono text-xs text-ink/40">
                          · {calcDuration(role.startDate, role.endDate)}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-ink/60 text-sm leading-relaxed">{role.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile tech tags */}
              {item.technologies?.length > 0 && (
                <div className="sm:hidden flex flex-wrap gap-1 mt-4 pt-4 border-t border-line">
                  {item.technologies.map(t => (
                    <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full border border-line text-ink/50">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
