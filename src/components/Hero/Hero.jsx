import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { SiLeetcode } from 'react-icons/si';
import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';
import dataApi from '../../api/dataApi';
import Reveal from '../Reveal';
import ResumeModal from './ResumeModal';

const ICONS = {
  github: FiGithub,
  linkedin: FiLinkedin,
  leetcode: SiLeetcode,
  email: FiMail,
};

export default function Hero() {
  const { data, loading } = usePortfolio();
  const profile = data?.profile;

  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  // The middleware's GET /api/resume requires a bearer token, which a
  // plain <a href>/<iframe src> can never send — so it's fetched here as
  // a blob through the same authenticated axios client used for /all and
  // /contact, then handed to the modal as an object URL.
  const openResume = async () => {
    if (resumeLoading) return;
    setResumeLoading(true);
    setResumeError(null);
    try {
      const res = await dataApi.get('/resume', { responseType: 'blob' });
      setResumeUrl(URL.createObjectURL(res.data));
    } catch (err) {
      setResumeError(err.message || 'Failed to load resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  const closeResume = () => {
    if (resumeUrl) URL.revokeObjectURL(resumeUrl);
    setResumeUrl(null);
  };

  return (
    <section
      id="home"
      className="flex items-center px-6 md:px-12 lg:px-24 pt-20 md:pt-0 pb-10 md:pb-14"
      style={{ minHeight: '100dvh' }}
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
        {/* Image — order 1 on mobile, right on desktop */}
        <Reveal y={60} className="order-1 md:order-2 flex justify-center">
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent-violet/30 to-accent-mint/30 blur-2xl" />
            {loading ? (
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-72 md:h-72 rounded-3xl glass animate-pulse" />
            ) : (
              <img
                src={profile?.profileImage || 'https://via.placeholder.com/400'}
                alt={profile?.name || 'Profile'}
                className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-72 md:h-72 object-cover rounded-3xl border border-line"
              />
            )}
          </motion.div>
        </Reveal>

        {/* Text */}
        <div className="order-2 md:order-1 text-center md:text-left">
          <Reveal>
            <p className="eyebrow mb-4">Hello, I&apos;m</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-display font-extrabold leading-tight mb-3 break-words [text-wrap:balance] text-[clamp(1.75rem,6vw,3.75rem)]">
              {loading
                ? <span className="inline-block w-48 h-10 glass rounded animate-pulse" />
                : profile?.name || 'Your Name'}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <h2 className="font-mono text-lg md:text-2xl gradient-text mb-5">
              {profile?.role || 'Full Stack Developer'}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-ink/70 max-w-xl mx-auto md:mx-0 mb-7 leading-relaxed">
              {profile?.description || ''}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {profile?.resumeFile && (
                <button
                  type="button"
                  onClick={openResume}
                  disabled={resumeLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-violet text-white font-mono text-sm font-medium hover:bg-accent-violet/90 transition-colors disabled:opacity-60"
                >
                  <FiFileText /> {resumeLoading ? 'Loading…' : 'Resume'}
                </button>
              )}
              <div className="flex items-center gap-3">
                {profile?.socialLinks &&
                  Object.entries(profile.socialLinks)
                    .filter(([key]) => ICONS[key.trim().toLowerCase()])
                    .map(([key, url]) => {
                      const Icon = ICONS[key.trim().toLowerCase()];
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-line text-ink/70 hover:text-accent-mint hover:border-accent-mint transition-colors"
                          aria-label={key}
                        >
                          <Icon size={16} />
                        </a>
                      );
                    })}
              </div>
            </div>
            {resumeError && (
              <p className="text-red-400 text-xs font-mono mt-3">{resumeError}</p>
            )}
          </Reveal>
        </div>
      </div>

      <ResumeModal url={resumeUrl} onClose={closeResume} />
    </section>
  );
}
