import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGithub, FiExternalLink } from 'react-icons/fi';

export default function ProjectModal({ project, onClose }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            <div className="relative">
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-56 object-cover rounded-t-2xl"
                />
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-bg/80 text-ink"
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6">
              <h3 className="font-display font-bold text-2xl mb-2">{project.title}</h3>
              <p className="text-ink/70 leading-relaxed mb-4">
                {project.details || project.description}
              </p>
              {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2 py-1 rounded-full border border-line text-ink/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-sm font-mono hover:border-accent-mint hover:text-accent-mint transition-colors"
                  >
                    <FiGithub /> Code
                  </a>
                )}
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-violet text-white text-sm font-mono hover:bg-accent-violet/90 transition-colors"
                  >
                    <FiExternalLink /> Live
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
