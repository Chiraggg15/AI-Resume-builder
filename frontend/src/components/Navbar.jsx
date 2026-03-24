/**
 * Navbar.jsx
 * ----------
 * Top navigation bar shown on all authenticated pages.
 * Shows app logo, navigation links, and logout button.
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LayoutDashboard, LogOut, Sparkles, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link to="/dashboard" className="navbar__logo">
          <div className="navbar__logo-icon">
            <Sparkles size={18} />
          </div>
          <span>ResumeAI</span>
        </Link>

        {/* ── Navigation Links ──────────────────────────────────────────── */}
        <div className="navbar__links">
          <Link
            to="/dashboard"
            className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/resume/new"
            className={`navbar__link ${isActive('/resume') ? 'navbar__link--active' : ''}`}
          >
            <FileText size={16} />
            <span>New Resume</span>
          </Link>
        </div>

        {/* ── User + Logout ─────────────────────────────────────────────── */}
        <div className="navbar__user">
          <div className="navbar__avatar">
            <User size={16} />
          </div>
          <span className="navbar__name hide-mobile">
            {user?.full_name?.split(' ')[0] || 'User'}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={16} />
            <span className="hide-mobile">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
