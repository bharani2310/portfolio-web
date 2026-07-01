import { usePortfolio } from '../../hooks/usePortfolioContext.jsx';

export default function Footer() {
  const { data } = usePortfolio();
  const year = new Date().getFullYear();
  return (
    <footer className="px-6 md:px-12 lg:px-24 py-8 border-t border-line">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-xs text-ink/40">
          © {year} {data?.profile?.name || 'Your Name'}. All rights reserved.
        </p>
        <p className="font-mono text-xs text-ink/40">Built with React &amp; Node.js</p>
      </div>
    </footer>
  );
}
