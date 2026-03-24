/**
 * Register.jsx
 * ------------
 * Registration page with full name, email, and password form.
 * On success: stores JWT, redirects to /dashboard.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const PERKS = [
  'AI-powered resume generation',
  'ATS keyword analysis & scoring',
  'Cover letter generation',
  'PDF export',
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())      errs.full_name = 'Full name is required';
    if (!form.email.trim())          errs.email     = 'Email is required';
    if (form.password.length < 8)    errs.password  = 'Minimum 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome to ResumeAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--split">
      {/* Background decorations */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />

      {/* Left: Perks panel */}
      <div className="auth-perks hide-mobile">
        <div className="auth-logo">
          <Sparkles size={24} />
        </div>
        <h2>Build resumes that<br /><span className="gradient-text">land interviews</span></h2>
        <p className="text-muted" style={{ marginTop: 12 }}>
          AI-powered tools to create, optimize, and tailor your resume for every job.
        </p>
        <ul className="auth-perk-list">
          {PERKS.map((p) => (
            <li key={p} className="auth-perk-item">
              <CheckCircle size={18} color="var(--success)" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Form */}
      <div className="auth-card auth-card--right fade-in">
        <div className="auth-header">
          <h1>Create account</h1>
          <p className="text-muted">Get started for free — no credit card required</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Chirag Lama"
              className={`form-input ${errors.full_name ? 'form-input--error' : ''}`}
            />
            {errors.full_name && <span className="auth-error">{errors.full_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-icon-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              className={`form-input ${errors.confirm ? 'form-input--error' : ''}`}
            />
            {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            id="register-submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
