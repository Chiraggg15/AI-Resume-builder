import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PenTool, MessageSquare, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4 flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-start">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-lg">L</div>
          <span className="font-bold tracking-tight text-white hidden md:block">Luminary</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'      },
            { to: '/resume/new',    icon: FileText,        label: 'Builder'        },
            { to: '/cover-letter',  icon: PenTool,         label: 'Cover Letter'   },
            { to: '/mock-interview',icon: MessageSquare,   label: 'Interview Prep' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'text-white bg-zinc-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
              }`}
            >
              <Icon size={16} />
              <span className="hidden lg:inline-block">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User + Settings + Logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-400 hidden sm:block">
          {user?.full_name?.split(' ')[0] || 'User'}
        </span>
        <Link
          to="/settings"
          className={`p-2 rounded-lg border transition-colors ${
            isActive('/settings')
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
          }`}
          title="Account Settings"
        >
          <Settings size={16} />
        </Link>
        <button
          className="text-sm font-medium px-4 py-2 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
