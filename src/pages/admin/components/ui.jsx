import { forwardRef } from 'react';

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="block font-mono text-xs text-ink/50 mb-2">{label}</span>
      <input
        {...props}
        className="w-full bg-transparent border border-line rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-mint"
      />
    </label>
  );
}

export function TextAreaField({ label, ...props }) {
  return (
    <label className="block">
      <span className="block font-mono text-xs text-ink/50 mb-2">{label}</span>
      <textarea
        {...props}
        className="w-full bg-transparent border border-line rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent-mint resize-none"
      />
    </label>
  );
}

export function SelectField({ label, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block font-mono text-xs text-ink/50 mb-2">{label}</span>}
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none bg-bg-surface border border-line rounded-lg pl-4 pr-10 py-2.5 text-sm text-ink focus:outline-none focus:border-accent-mint ${className}`}
        >
          {children}
        </select>
        {/* Custom chevron — native arrows render inconsistently and don't follow the theme */}
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'px-5 py-2.5 rounded-full font-mono text-sm transition-colors disabled:opacity-50';
  const variants = {
    primary: 'bg-accent-violet text-white hover:bg-accent-violet/90',
    ghost: 'border border-line text-ink/70 hover:border-accent-mint hover:text-accent-mint',
    danger: 'border border-red-400/40 text-red-400 hover:bg-red-400/10',
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}

export const Card = forwardRef(function Card({ children, className = '' }, ref) {
  return <div ref={ref} className={`glass rounded-2xl p-6 ${className}`}>{children}</div>;
});

export function StatusBanner({ status, success, error }) {
  if (!status) return null;
  return (
    <p className={`font-mono text-sm ${status === 'success' ? 'text-accent-mint' : 'text-red-400'}`}>
      {status === 'success' ? success : error}
    </p>
  );
}