/**
 * ResumePreview.jsx
 * Reusable resume renderer — used in both the live preview panel
 * and the full Preview step in ResumeBuilder.
 */

export default function ResumePreview({ resume, compact = false }) {
  const p = resume?.personal_info || {};
  const experience = resume?.experience || [];
  const education = resume?.education || [];
  const skills = resume?.skills || { technical: [], soft: [] };

  const scale = compact ? 'text-[9px]' : 'text-[14px]';
  const headingSize = compact ? 'text-[13px]' : 'text-[28px]';
  const sectionHead = compact
    ? 'text-[7px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 border-b border-zinc-200 pb-1'
    : 'text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2';

  return (
    <div
      className={`bg-white text-zinc-900 font-sans border-t-[6px] border-zinc-900 ${
        compact ? 'rounded shadow-lg p-4' : 'rounded-sm p-8 shadow-2xl min-h-[850px]'
      }`}
    >
      {/* Header */}
      <div className={`${compact ? 'mb-3 pb-3' : 'mb-6 pb-6'} border-b border-zinc-200`}>
        <h1 className={`${headingSize} font-extrabold text-zinc-950 uppercase tracking-tighter ${compact ? 'mb-1' : 'mb-2'} leading-tight`}>
          {p.full_name || (compact ? 'Your Name' : 'YOUR NAME')}
        </h1>
        <div className={`flex flex-wrap gap-x-2 gap-y-0.5 ${scale} text-zinc-600 font-medium`}>
          {p.email    && <span>{p.email}</span>}
          {p.phone    && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && !compact && <span>• {p.linkedin}</span>}
          {p.github   && !compact && <span>• {p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <section className={compact ? 'mb-3' : 'mb-6'}>
          <p className={`${scale} text-zinc-700 leading-relaxed`}>{p.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className={compact ? 'mb-3' : 'mb-6'}>
          <h4 className={sectionHead}>Experience</h4>
          <div className={compact ? 'space-y-2' : 'space-y-6'}>
            {experience.map((e, i) => (
              <div key={i}>
                <div className={`flex justify-between items-baseline ${compact ? 'mb-0' : 'mb-0.5'}`}>
                  <strong className={`text-zinc-900 ${compact ? 'text-[9px]' : 'text-[15px]'}`}>{e.position}</strong>
                  <span className={`${compact ? 'text-[7px]' : 'text-[13px]'} text-zinc-500 font-semibold uppercase tracking-wider`}>
                    {e.start_date} — {e.end_date || 'Present'}
                  </span>
                </div>
                <div className={`${compact ? 'text-[8px]' : 'text-[14px]'} text-emerald-700 font-semibold ${compact ? 'mb-0.5' : 'mb-2'}`}>{e.company}</div>
                {!compact && (
                  <div className="text-[14px] text-zinc-700 leading-relaxed whitespace-pre-line ml-4 shadow-[inset_2px_0_0_#e4e4e7] pl-4">
                    {e.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className={compact ? 'mb-3' : 'mb-6'}>
          <h4 className={sectionHead}>Education</h4>
          <div className={compact ? 'space-y-1' : 'space-y-4'}>
            {education.map((e, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <div>
                  <strong className={`text-zinc-900 block ${compact ? 'text-[9px]' : 'text-[15px]'}`}>{e.institution}</strong>
                  <span className={`${compact ? 'text-[7px]' : 'text-[14px]'} text-zinc-600`}>
                    {e.degree} {e.field_of_study && `in ${e.field_of_study}`} {e.grade && `· ${e.grade}`}
                  </span>
                </div>
                <span className={`${compact ? 'text-[7px]' : 'text-[13px]'} text-zinc-500 font-semibold uppercase tracking-wider`}>
                  {e.start_date} — {e.end_date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <section>
          <h4 className={sectionHead}>Skills</h4>
          <div className={`space-y-1 ${scale}`}>
            {skills.technical?.length > 0 && (
              <div className="text-zinc-700">
                <strong className="text-zinc-900 mr-1">Technical:</strong>
                {skills.technical.join(', ')}
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div className="text-zinc-700">
                <strong className="text-zinc-900 mr-1">Soft Skills:</strong>
                {skills.soft.join(', ')}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
