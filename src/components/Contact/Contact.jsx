import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';
import { contactService } from '../../services/portfolioService';
import Reveal from '../Reveal';

const initialForm = { name: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await contactService.send(form);
      setStatus('success');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <section id="contact" className="section-pad">
      <Reveal>
        <p className="eyebrow mb-3">Contact</p>
        <h2 className="font-display font-bold text-3xl md:text-5xl mb-12">
          Let&apos;s <span className="gradient-text">Talk</span>
        </h2>
      </Reveal>

      <Reveal delay={0.1} className="max-w-xl">
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label className="block font-mono text-xs text-ink/50 mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-mint transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-ink/50 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-mint transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-ink/50 mb-2" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent-mint transition-colors resize-none"
              placeholder="Tell me about your project..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent-violet text-white font-mono text-sm font-medium hover:bg-accent-violet/90 transition-colors disabled:opacity-50"
          >
            <FiSend /> {submitting ? 'Sending...' : 'Send Message'}
          </button>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-accent-mint text-sm font-mono"
              >
                <FiCheckCircle /> Message sent successfully!
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-400 text-sm font-mono"
              >
                <FiAlertCircle /> Something went wrong. Please try again.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Reveal>
    </section>
  );
}
