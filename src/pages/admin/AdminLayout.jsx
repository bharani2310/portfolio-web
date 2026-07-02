import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiBriefcase, FiCode, FiFolder, FiMail, FiLock, FiLogOut, FiExternalLink } from 'react-icons/fi';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

const NAV = [
  { to: '/admin', label: 'Profile', icon: FiUser, end: true },
  { to: '/admin/experience', label: 'Experience', icon: FiBriefcase },
  { to: '/admin/skills', label: 'Skills', icon: FiCode },
  { to: '/admin/projects', label: 'Projects', icon: FiFolder },
  { to: '/admin/messages', label: 'Messages', icon: FiMail },
  { to: '/admin/password', label: 'Password', icon: FiLock },
];

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/admin/login', { replace: true });
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 glass md:sticky md:top-0 md:h-screen md:overflow-y-auto p-5 flex md:flex-col gap-2 overflow-x-auto border-b md:border-b-0 md:border-r border-line">
        <h1 className="hidden md:block font-display font-bold text-xl mb-6">
          <span className="text-ink">&lt;</span>
          <span className="gradient-text">Admin</span>
          <span className="text-ink">/&gt;</span>
        </h1>

        <nav className="flex md:flex-col gap-1 flex-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-accent-mint/10 text-accent-mint border border-accent-mint/30'
                    : 'text-ink/60 hover:text-ink hover:bg-line/30 border border-transparent'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex flex-col gap-1 mt-6 pt-6 border-t border-line">
          <a
            href={import.meta.env.VITE_API_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm text-ink/60 hover:text-ink hover:bg-line/30"
          >
            <FiExternalLink size={16} /> View API Docs
          </a>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm text-ink/60 hover:text-ink hover:bg-line/30"
          >
            <FiExternalLink size={16} /> View Site
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-60"
          >
            {loggingOut
              ? <><span className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Logging out…</>
              : <><FiLogOut size={16} /> Logout</>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        <Outlet />
      </main>
    </div>
  );
}
