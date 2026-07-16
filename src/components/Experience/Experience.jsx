import { FiBriefcase } from 'react-icons/fi';
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

// Total time at the company overall — spans from the earliest role's
// start date to the latest role's end date (or "now" if any role there
// is still ongoing) — not just a single role's individual duration.
function calcTotalDuration(roles = []) {
  if (!roles.length) return null;
  const starts = roles.map((r) => new Date(r.startDate).getTime());
  const ends = roles.map((r) => (r.endDate ? new Date(r.endDate).getTime() : Date.now()));
  const earliestStart = Math.min(...starts);
  const latestEnd = Math.max(...ends);
  return calcDuration(earliestStart, latestEnd);
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
              {/* Company header: logo + name on top, technologies below a
                  divider line so a long/growing tech list can never
                  squeeze the company name — it just wraps onto more
                  lines of its own, right-aligned. */}
              <div className="mb-4 pb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.companyName}
                      className="w-11 h-11 rounded-lg object-cover border border-line shrink-0 bg-bg"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg border border-line bg-bg-surface flex items-center justify-center shrink-0">
                      <FiBriefcase className="text-ink/30" size={18} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="font-display font-bold text-xl min-w-0 break-words">{item.companyName}</h3>
                    {calcTotalDuration(item.roles) && (
                      <span className="shrink-0 font-mono text-xs text-accent-mint whitespace-nowrap">
                        {calcTotalDuration(item.roles)}
                      </span>
                    )}
                  </div>
                </div>

                {item.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end mt-3 pt-3 border-t border-line/60">
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
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
