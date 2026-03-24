/**
 * ResumeBuilder.jsx
 * -----------------
 * Multi-step form for creating/editing resumes.
 * Steps: Personal Info → Experience → Education → Skills → AI Tools → Preview
 *
 * Supports both creating a NEW resume and editing an EXISTING one (via :id route).
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Briefcase, GraduationCap, Wrench,
  Sparkles, Eye, Save, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI, aiAPI } from '../services/api';
import './ResumeBuilder.css';

// ── Step Definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Personal',    icon: User         },
  { id: 1, label: 'Experience',  icon: Briefcase    },
  { id: 2, label: 'Education',   icon: GraduationCap},
  { id: 3, label: 'Skills',      icon: Wrench       },
  { id: 4, label: 'AI Tools',    icon: Sparkles     },
  { id: 5, label: 'Preview',     icon: Eye          },
];

// ── Initial State ─────────────────────────────────────────────────────────────
const EMPTY_RESUME = {
  title: 'My Resume',
  template: 'modern',
  personal_info: {
    full_name: '', email: '', phone: '', location: '',
    linkedin: '', github: '', portfolio: '', summary: '',
  },
  experience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  languages: [],
};

const EMPTY_EXP = { company: '', position: '', start_date: '', end_date: '', description: '', is_current: false };
const EMPTY_EDU = { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' };

export default function ResumeBuilder() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEditing = !!id;

  const [step, setStep]           = useState(0);
  const [resume, setResume]       = useState(EMPTY_RESUME);
  const [saving, setSaving]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeId, setResumeId]   = useState(id || null);

  // AI input state
  const [aiForm, setAiForm] = useState({
    job_title: '', skills: '', experience_years: 0, industry: 'Technology',
    job_description: '', resume_text: '',
  });
  const [analysis, setAnalysis] = useState(null);

  // ── Load existing resume for editing ──────────────────────────────────────
  useEffect(() => {
    if (!isEditing) return;
    resumeAPI.getById(id)
      .then(res => setResume({ ...EMPTY_RESUME, ...res.data }))
      .catch(() => { toast.error('Resume not found'); navigate('/dashboard'); });
  }, [id, isEditing, navigate]);

  // ── Field updaters ─────────────────────────────────────────────────────────
  const updatePersonal = (field, value) =>
    setResume(r => ({ ...r, personal_info: { ...r.personal_info, [field]: value } }));

  const updateExp = (idx, field, value) =>
    setResume(r => {
      const exp = [...r.experience];
      exp[idx] = { ...exp[idx], [field]: field === 'is_current' ? value : value };
      if (field === 'is_current' && value) exp[idx].end_date = 'Present';
      return { ...r, experience: exp };
    });

  const addExp    = () => setResume(r => ({ ...r, experience: [...r.experience, { ...EMPTY_EXP }] }));
  const removeExp = (i) => setResume(r => ({ ...r, experience: r.experience.filter((_, idx) => idx !== i) }));

  const updateEdu = (idx, field, value) =>
    setResume(r => { const e=[...r.education]; e[idx]={...e[idx],[field]:value}; return{...r,education:e}; });
  const addEdu    = () => setResume(r => ({ ...r, education: [...r.education, { ...EMPTY_EDU }] }));
  const removeEdu = (i) => setResume(r => ({ ...r, education: r.education.filter((_,idx)=>idx!==i) }));

  const updateSkillsStr = (type, value) =>
    setResume(r => ({ ...r, skills: { ...r.skills, [type]: value.split(',').map(s => s.trim()).filter(Boolean) } }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (resumeId) {
        await resumeAPI.update(resumeId, resume);
        toast.success('Resume saved!');
      } else {
        const res = await resumeAPI.create(resume);
        setResumeId(res.data.resume.id);
        toast.success('Resume created!');
      }
    } catch {
      toast.error('Could not save resume');
    } finally {
      setSaving(false);
    }
  }, [resume, resumeId]);

  // ── AI: Generate Resume ────────────────────────────────────────────────────
  const handleAIGenerate = async () => {
    if (!aiForm.job_title) return toast.error('Job title is required');
    setAiLoading(true);
    try {
      const res = await aiAPI.generateResume({
        job_title: aiForm.job_title,
        skills: aiForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_years: Number(aiForm.experience_years),
        industry: aiForm.industry,
      });
      const gen = res.data.generated;
      setResume(r => ({
        ...r,
        personal_info: { ...r.personal_info, summary: gen.summary },
        skills: { ...r.skills, technical: [...new Set([...r.skills.technical, ...gen.suggested_skills])] },
      }));
      toast.success('AI content generated and added to your resume!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  // ── AI: Analyze ────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!aiForm.job_description) return toast.error('Paste a job description first');
    setAiLoading(true);
    try {
      // Build plain text from resume data
      const text = [
        resume.personal_info.summary,
        resume.experience.map(e => `${e.position} at ${e.company}\n${e.description}`).join('\n'),
        resume.skills.technical.join(', '),
      ].join('\n\n');

      const res = await aiAPI.analyzeResume({ resume_text: text, job_description: aiForm.job_description });
      setAnalysis(res.data.analysis);
      toast.success(`ATS Score: ${res.data.analysis.ats_score}%`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Render step content ────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // Step 0: Personal Info
      case 0: return (
        <div className="step-content fade-in">
          <h3>Personal Information</h3>
          <p className="text-muted text-sm mb-6">Your basic contact details that appear at the top of your resume.</p>
          <div className="builder-grid">
            {[
              ['full_name','Full Name','John Doe'],['email','Email','john@email.com'],
              ['phone','Phone','+1 (555) 000-0000'],['location','Location','New York, NY'],
              ['linkedin','LinkedIn URL','linkedin.com/in/johndoe'],['github','GitHub URL','github.com/johndoe'],
              ['portfolio','Portfolio URL','johndoe.dev'],
            ].map(([field, label, placeholder]) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={placeholder}
                  value={resume.personal_info[field] || ''}
                  onChange={e => updatePersonal(field, e.target.value)}
                />
              </div>
            ))}
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Professional Summary</label>
              <textarea
                className="form-input"
                placeholder="Write a 2-3 sentence professional summary highlighting your experience and key skills..."
                value={resume.personal_info.summary || ''}
                onChange={e => updatePersonal('summary', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>
      );

      // Step 1: Experience
      case 1: return (
        <div className="step-content fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3>Work Experience</h3>
              <p className="text-muted text-sm">Add your most recent work experiences first.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addExp}><Plus size={14}/> Add</button>
          </div>
          {resume.experience.length === 0 && (
            <div className="builder-empty">
              <Briefcase size={32} />
              <p>No experience added yet. Click &quot;Add&quot; to begin.</p>
            </div>
          )}
          {resume.experience.map((exp, i) => (
            <div key={i} className="entry-card card">
              <div className="entry-card__header">
                <span className="badge badge-purple">#{i + 1}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeExp(i)}><Trash2 size={14}/></button>
              </div>
              <div className="builder-grid">
                {[['company','Company','Google'],['position','Position','Software Engineer']].map(([f,l,p]) => (
                  <div key={f} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" placeholder={p} value={exp[f]||''} onChange={e=>updateExp(i,f,e.target.value)}/>
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="month" value={exp.start_date||''} onChange={e=>updateExp(i,'start_date',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type={exp.is_current?'text':'month'} disabled={exp.is_current} value={exp.is_current?'Present':exp.end_date||''} onChange={e=>updateExp(i,'end_date',e.target.value)}/>
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label" style={{display:'flex',gap:8,alignItems:'center'}}>
                    <input type="checkbox" checked={exp.is_current||false} onChange={e=>updateExp(i,'is_current',e.target.checked)}/>
                    Currently working here
                  </label>
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Description (use bullet points)</label>
                  <textarea className="form-input" rows={4} placeholder="• Developed...\n• Led...\n• Achieved..." value={exp.description||''} onChange={e=>updateExp(i,'description',e.target.value)}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

      // Step 2: Education
      case 2: return (
        <div className="step-content fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3>Education</h3>
              <p className="text-muted text-sm">Add your educational qualifications.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addEdu}><Plus size={14}/> Add</button>
          </div>
          {resume.education.length === 0 && (
            <div className="builder-empty"><GraduationCap size={32}/><p>No education added yet.</p></div>
          )}
          {resume.education.map((edu, i) => (
            <div key={i} className="entry-card card">
              <div className="entry-card__header">
                <span className="badge badge-purple">#{i+1}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeEdu(i)}><Trash2 size={14}/></button>
              </div>
              <div className="builder-grid">
                {[
                  ['institution','Institution','Harvard University'],
                  ['degree','Degree','Bachelor of Science'],
                  ['field_of_study','Field of Study','Computer Science'],
                  ['grade','Grade / GPA','3.8 GPA'],
                ].map(([f,l,p]) => (
                  <div key={f} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" placeholder={p} value={edu[f]||''} onChange={e=>updateEdu(i,f,e.target.value)}/>
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Start</label>
                  <input className="form-input" type="month" value={edu.start_date||''} onChange={e=>updateEdu(i,'start_date',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">End</label>
                  <input className="form-input" type="month" value={edu.end_date||''} onChange={e=>updateEdu(i,'end_date',e.target.value)}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

      // Step 3: Skills
      case 3: return (
        <div className="step-content fade-in">
          <h3>Skills</h3>
          <p className="text-muted text-sm mb-6">Separate each skill with a comma.</p>
          <div className="form-group">
            <label className="form-label">Technical Skills</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Python, React, MongoDB, Docker, REST API, Git..."
              value={resume.skills.technical.join(', ')}
              onChange={e => updateSkillsStr('technical', e.target.value)}
            />
            <div className="skill-chips">
              {resume.skills.technical.map(s => (
                <span key={s} className="badge badge-purple">{s}</span>
              ))}
            </div>
          </div>
          <div className="form-group mt-4">
            <label className="form-label">Soft Skills</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Leadership, Communication, Problem Solving..."
              value={resume.skills.soft.join(', ')}
              onChange={e => updateSkillsStr('soft', e.target.value)}
            />
            <div className="skill-chips">
              {resume.skills.soft.map(s => (
                <span key={s} className="badge badge-green">{s}</span>
              ))}
            </div>
          </div>
          <div className="form-group mt-4">
            <label className="form-label">Resume Title</label>
            <input
              className="form-input"
              placeholder="e.g. Software Engineer Resume"
              value={resume.title}
              onChange={e => setResume(r => ({ ...r, title: e.target.value }))}
            />
          </div>
        </div>
      );

      // Step 4: AI Tools
      case 4: return (
        <div className="step-content fade-in">
          <h3 className="flex items-center gap-4"><Sparkles size={20} color="#a78bfa"/> AI Tools</h3>
          <p className="text-muted text-sm mb-6">Use AI to generate content and analyze your resume.</p>

          {/* AI Generate */}
          <div className="ai-panel card">
            <h4 className="flex items-center gap-4"><Sparkles size={16}/> Generate Resume Content</h4>
            <p className="text-muted text-sm">AI will write your professional summary and suggest skills.</p>
            <div className="builder-grid" style={{marginTop:16}}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" placeholder="Software Engineer" value={aiForm.job_title} onChange={e=>setAiForm(f=>({...f,job_title:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-input" value={aiForm.industry} onChange={e=>setAiForm(f=>({...f,industry:e.target.value}))}>
                  {['Technology','Finance','Healthcare','Marketing','Education','Design','Other'].map(i=>(
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min="0" max="40" value={aiForm.experience_years} onChange={e=>setAiForm(f=>({...f,experience_years:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Key Skills (comma separated)</label>
                <input className="form-input" placeholder="Python, React, AWS" value={aiForm.skills} onChange={e=>setAiForm(f=>({...f,skills:e.target.value}))}/>
              </div>
            </div>
            <button
              id="ai-generate-btn"
              className="btn btn-primary mt-4"
              onClick={handleAIGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? <><div className="spinner"/> Generating...</> : <><Sparkles size={16}/> Generate with AI</>}
            </button>
          </div>

          {/* ATS Analyzer */}
          <div className="ai-panel card" style={{marginTop:20}}>
            <h4>🎯 ATS Resume Analyzer</h4>
            <p className="text-muted text-sm">Paste a job description to see how well your resume matches.</p>
            <div className="form-group" style={{marginTop:16}}>
              <label className="form-label">Job Description</label>
              <textarea
                className="form-input"
                rows={5}
                placeholder="Paste the full job description here..."
                value={aiForm.job_description}
                onChange={e => setAiForm(f => ({ ...f, job_description: e.target.value }))}
              />
            </div>
            <button
              id="analyze-btn"
              className="btn btn-secondary mt-4"
              onClick={handleAnalyze}
              disabled={aiLoading}
            >
              {aiLoading ? <><div className="spinner"/> Analyzing...</> : '🔍 Analyze Resume'}
            </button>

            {/* Analysis Results */}
            {analysis && (
              <div className="analysis-result fade-in">
                <div className="analysis-score">
                  <div className="score-ring">
                    <div className="score-ring__number">{analysis.ats_score}%</div>
                    <span className={`badge ${analysis.ats_score>=70?'badge-green':analysis.ats_score>=50?'badge-yellow':'badge-red'}`}>
                      {analysis.score_label}
                    </span>
                  </div>
                </div>
                <div className="analysis-detail">
                  <div>
                    <p className="form-label mb-6">✅ Matched Keywords</p>
                    <div className="skill-chips">
                      {analysis.matched_keywords.map(k=><span key={k} className="badge badge-green">{k}</span>)}
                    </div>
                  </div>
                  <div style={{marginTop:16}}>
                    <p className="form-label mb-6">❌ Missing Keywords</p>
                    <div className="skill-chips">
                      {analysis.missing_keywords.map(k=><span key={k} className="badge badge-red">{k}</span>)}
                    </div>
                  </div>
                  <div style={{marginTop:16}}>
                    <p className="form-label mb-6">💡 Suggestions</p>
                    <ul className="suggestion-list">
                      {analysis.suggestions.map((s,i)=><li key={i} className="text-sm text-muted">{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

      // Step 5: Preview
      case 5: return (
        <div className="step-content fade-in">
          <h3>Resume Preview</h3>
          <p className="text-muted text-sm mb-6">Review your resume before saving.</p>
          <div className="resume-preview card">
            <div className="preview-header">
              <h2>{resume.personal_info.full_name || 'Your Name'}</h2>
              <div className="preview-contact">
                {resume.personal_info.email    && <span>✉ {resume.personal_info.email}</span>}
                {resume.personal_info.phone    && <span>📞 {resume.personal_info.phone}</span>}
                {resume.personal_info.location && <span>📍 {resume.personal_info.location}</span>}
              </div>
            </div>
            {resume.personal_info.summary && (
              <section className="preview-section">
                <h4 className="preview-section__title">PROFESSIONAL SUMMARY</h4>
                <p className="text-sm">{resume.personal_info.summary}</p>
              </section>
            )}
            {resume.experience.length>0 && (
              <section className="preview-section">
                <h4 className="preview-section__title">EXPERIENCE</h4>
                {resume.experience.map((e,i) => (
                  <div key={i} className="preview-entry">
                    <div className="preview-entry__head">
                      <strong>{e.position}</strong>
                      <span className="text-sm text-muted">{e.start_date} – {e.end_date || 'Present'}</span>
                    </div>
                    <div className="text-sm" style={{color:'var(--text-secondary)'}}>{e.company}</div>
                    <p className="text-sm" style={{marginTop:6, whiteSpace:'pre-line'}}>{e.description}</p>
                  </div>
                ))}
              </section>
            )}
            {resume.education.length>0 && (
              <section className="preview-section">
                <h4 className="preview-section__title">EDUCATION</h4>
                {resume.education.map((e,i) => (
                  <div key={i} className="preview-entry">
                    <div className="preview-entry__head">
                      <strong>{e.institution}</strong>
                      <span className="text-sm text-muted">{e.start_date} – {e.end_date}</span>
                    </div>
                    <div className="text-sm text-muted">{e.degree} in {e.field_of_study} {e.grade && `· ${e.grade}`}</div>
                  </div>
                ))}
              </section>
            )}
            {(resume.skills.technical.length>0||resume.skills.soft.length>0) && (
              <section className="preview-section">
                <h4 className="preview-section__title">SKILLS</h4>
                {resume.skills.technical.length>0 && (
                  <p className="text-sm"><strong>Technical:</strong> {resume.skills.technical.join(' · ')}</p>
                )}
                {resume.skills.soft.length>0 && (
                  <p className="text-sm"><strong>Soft:</strong> {resume.skills.soft.join(' · ')}</p>
                )}
              </section>
            )}
          </div>
        </div>
      );
      default: return null;
    }
  };

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper fade-in">
      {/* Header */}
      <div className="builder-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16}/> Dashboard
        </button>
        <h2>{isEditing ? 'Edit Resume' : 'New Resume'}</h2>
        <button
          id="save-resume-btn"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <><div className="spinner"/> Saving...</> : <><Save size={14}/> Save</>}
        </button>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator" style={{margin:'24px 0', overflowX:'auto', paddingBottom:4}}>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.id} style={{display:'flex',alignItems:'center'}}>
              <button
                className={`step ${done?'done':''} ${active?'active':''}`}
                onClick={() => setStep(i)}
                style={{background:'none',border:'none',cursor:'pointer',padding:'4px 8px'}}
              >
                <div className="step__num">
                  {done ? <CheckCircle size={14}/> : <Icon size={14}/>}
                </div>
                <span className="hide-mobile">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`step__line ${done ? 'done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="builder-body card">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="builder-nav">
        <button
          className="btn btn-secondary"
          onClick={() => setStep(s => Math.max(0, s-1))}
          disabled={step === 0}
        >
          <ArrowLeft size={16}/> Previous
        </button>
        <span className="text-sm text-muted">{step + 1} / {STEPS.length}</span>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(s => s+1)}>
            Next <ArrowRight size={16}/>
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><div className="spinner"/> Saving...</> : <><Save size={16}/> Save Resume</>}
          </button>
        )}
      </div>
    </div>
  );
}
