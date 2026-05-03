/**
 * api.js  –  Axios API Layer
 * --------------------------
 * Centralized HTTP client:
 *  - Automatically attaches JWT Bearer token to every request
 *  - Handles 401 by redirecting to /login
 *  - Exports typed helper functions for each endpoint group
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Create Axios Instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
});

// ── Request Interceptor: Attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Handle Auth Errors ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// ═══════════════════════════════════════════════════════════════════════════
// Auth API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const authAPI = {
  /** Register a new user */
  register: (data) => api.post('/auth/register', data),

  /** Login and receive JWT */
  login: (data) => api.post('/auth/login', data),

  /** Get current user profile */
  getMe: () => api.get('/auth/me'),

  /** Login via Google SSO */
  googleLogin: (credential) => api.post('/auth/google-login', { credential }),

  /** Update user profile */
  updateMe: (data) => api.put('/auth/me', data),

  /** Request password reset email */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /** Reset password using token */
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),

  /** Change password while logged in */
  changePassword: (data) => api.post('/auth/change-password', data),
};


// ═══════════════════════════════════════════════════════════════════════════
// Resume API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const resumeAPI = {
  /** Get all resumes for current user */
  getAll: () => api.get('/resume/'),

  /** Get single resume by ID */
  getById: (id) => api.get(`/resume/${id}`),

  /** Create a new resume */
  create: (data) => api.post('/resume/', data),

  /** Update an existing resume */
  update: (id, data) => api.put(`/resume/${id}`, data),

  /** Delete a resume */
  delete: (id) => api.delete(`/resume/${id}`),

  /** Get version history snapshots */
  getHistory: (id) => api.get(`/resume/${id}/history`),

  /** Restore a specific snapshot */
  restore: (id, snapshotId) => api.post(`/resume/${id}/restore/${snapshotId}`),

  /** Update only the ATS score */
  updateScore: (id, score) => api.put(`/resume/${id}/score`, { ats_score: score }),
};


// ═══════════════════════════════════════════════════════════════════════════
// AI API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const aiAPI = {
  /** Generate resume content from inputs */
  generateResume: (data) => api.post('/ai/generate', data),

  /** Analyze resume against a job description */
  analyzeResume: (data) => api.post('/ai/analyze', data),

  /** Generate a tailored cover letter */
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),

  /** Improve a professional summary */
  improveSummary: (data) => api.post('/ai/improve-summary', data),
};

// ═══════════════════════════════════════════════════════════════════════════
// Interview API Calls
// ═══════════════════════════════════════════════════════════════════════════
export const interviewAPI = {
  /** Generate mock interview questions */
  generateQuestions: (data) => api.post('/interview/generate', data),
};

// ═══════════════════════════════════════════════════════════════════════════
// DOCX Export API
// ═══════════════════════════════════════════════════════════════════════════
export const docxAPI = {
  /** Generate a .docx file for a resume */
  generate: (resumeData) => api.post('/docx/generate', resumeData, { responseType: 'blob' }),
};

export default api;
