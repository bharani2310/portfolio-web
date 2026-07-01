import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme.jsx';
import useActiveSection from '../../hooks/useActiveSection';

const LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
];

const SECTION_IDS = LINKS.map((l) => l.id);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const activeId = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (open) {
      // Close the mobile menu first, then scroll once its collapse
      // animation has settled — otherwise the layout shift cancels
      // the smooth scroll mid-flight.
      setOpen(false);
      setTimeout(() => target?.scrollIntoView({ behavior: 'smooth' }), 320);
    } else {
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/10' : 'bg-transparent'
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-24 h-16 md:h-20">
        <button
          onClick={() => scrollTo('home')}
          className="font-display font-bold text-lg md:text-xl tracking-tight"
        >
          <span className="text-ink">&lt;</span>
          <span className="gradient-text">Dev</span>
          <span className="text-ink">/&gt;</span>
        </button>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="relative px-4 py-2 font-mono text-sm transition-colors"
              >
                <span
                  className={isActive ? 'text-accent-mint' : 'text-ink/60 hover:text-ink'}
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-accent-mint/10 border border-accent-mint/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-3 w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink/70 hover:text-accent-mint hover:border-accent-mint transition-colors"
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className="text-ink/70" aria-label="Toggle theme">
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="text-ink" aria-label="Menu">
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`font-mono text-sm text-left transition-colors ${
                    activeId === link.id ? 'text-accent-mint' : 'text-ink/80 hover:text-accent-mint'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
