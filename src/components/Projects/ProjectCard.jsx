import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

export default function ProjectCard({ project, index, onDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="glass rounded-2xl overflow-hidden flex flex-col"
    >
      {project.image && (
        <div className="overflow-hidden h-44">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-lg mb-2">{project.title}</h3>
        <p className="text-ink/60 text-sm leading-relaxed mb-4 flex-1">
          {project.description}
        </p>
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
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
        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => onDetails(project)}
            className="flex-1 px-4 py-2 rounded-full border border-line text-sm font-mono hover:border-accent-mint hover:text-accent-mint transition-colors"
          >
            More Details
          </button>
          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-accent-violet text-white text-sm font-mono flex items-center gap-1 hover:bg-accent-violet/90 transition-colors"
            >
              Live <FiExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
