/**
 * Dashboard.jsx
 * -------------
 * Main dashboard showing all user resumes.
 * Allows: create new, view, delete resumes.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Trash2, Edit3, Sparkles,
  Clock, TrendingUp, Award, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [resumes,  setResumes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null); // ID being deleted

  // ── Load resumes on mount ────────────────────────────────────────────────
  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeAPI.getAll();
      setResumes(res.data.resumes || []);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // ── Delete resume ────────────────────────────────────────────────────────
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume permanently?')) return;

    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(null);
    }
  };

  // ── Score badge color ────────────────────────────────────────────────────
  const scoreBadge = (score) => {
    if (score === null || score === undefined) return null;
    const cls = score >= 70 ? 'badge-green' : score >= 50 ? 'badge-yellow' : 'badge-red';
    return <span className={`badge ${cls}`}><TrendingUp size={10} /> ATS {score}%</span>;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper fade-in">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div>
          <h1>
            {greeting()},{' '}
            <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            Build and optimize your AI-powered resumes.
          </p>
        </div>
        <button
          id="create-resume-btn"
          className="btn btn-primary"
          onClick={() => navigate('/resume/new')}
        >
          <Plus size={18} /> New Resume
        </button>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────── */}
      <div className="dashboard-stats">
        <div className="stat-card card">
          <div className="stat-card__icon"><FileText size={20} /></div>
          <div>
            <div className="stat-card__value">{resumes.length}</div>
            <div className="stat-card__label">Total Resumes</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card__icon stat-card__icon--green"><Award size={20} /></div>
          <div>
            <div className="stat-card__value">
              {resumes.filter(r => r.ats_score >= 70).length}
            </div>
            <div className="stat-card__label">ATS Score ≥ 70%</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card__icon stat-card__icon--blue"><Sparkles size={20} /></div>
          <div>
            <div className="stat-card__value">
              {resumes.filter(r => r.is_ai_generated).length}
            </div>
            <div className="stat-card__label">AI Generated</div>
          </div>
        </div>
      </div>

      {/* ── Resume List ───────────────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16 }}>Your Resumes</h3>

        {loading ? (
          <div className="dashboard-empty">
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : resumes.length === 0 ? (
          <div className="dashboard-empty card">
            <div className="dashboard-empty__icon"><FileText size={40} /></div>
            <h3>No resumes yet</h3>
            <p className="text-muted">Create your first AI-powered resume to get started</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/resume/new')}>
              <Plus size={16} /> Create Resume
            </button>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="resume-card card"
                onClick={() => navigate(`/resume/${resume.id}`)}
                id={`resume-${resume.id}`}
              >
                <div className="resume-card__header">
                  <div className="resume-card__icon"><FileText size={20} /></div>
                  <div className="resume-card__actions">
                    {scoreBadge(resume.ats_score)}
                  </div>
                </div>

                <h4 className="resume-card__title">{resume.title || 'Untitled Resume'}</h4>
                <p className="resume-card__subtitle text-muted text-sm">
                  {resume.personal_info?.full_name || user?.full_name || '—'}
                </p>

                <div className="resume-card__meta">
                  <span className="flex items-center gap-4 text-xs text-muted">
                    <Clock size={12} />
                    {new Date(resume.updated_at).toLocaleDateString()}
                  </span>
                  {resume.is_ai_generated && (
                    <span className="badge badge-purple"><Sparkles size={10} /> AI</span>
                  )}
                </div>

                <div className="resume-card__footer">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/resume/${resume.id}`)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    id={`delete-resume-${resume.id}`}
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(resume.id, e)}
                    disabled={deleting === resume.id}
                  >
                    {deleting === resume.id ? <div className="spinner" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
