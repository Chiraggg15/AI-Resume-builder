import React from 'react';

const MinimalistClean = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#111827', fontFamily = 'Inter, sans-serif' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#111827',
  };

  return (
    <div className="bg-white p-12 max-w-[700px] mx-auto shadow-sm min-h-[1056px]" style={styles}>
      <header className="text-center mb-10">
        <h1 className="text-3xl tracking-[0.2em] uppercase font-light mb-4" style={{ color: accentColor }}>
          {resumeData?.contact?.name || 'Your Name'}
        </h1>
        <div className="text-xs tracking-wider flex justify-center flex-wrap gap-4 text-gray-500 uppercase">
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone}</span>}
          {resumeData?.contact?.location && <span>{resumeData.contact.location}</span>}
        </div>
      </header>

      {resumeData?.summary && (
        <section className="mb-10 text-center">
          <p className="text-sm font-light text-gray-600 leading-relaxed">
            {resumeData.summary}
          </p>
        </section>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-gray-400 text-center">
            Experience
          </h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-gray-900">{exp.title}</h3>
                <span className="text-xs text-gray-400">
                  {exp.startDate} — {exp.endDate}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">{exp.company}</div>
              <p className="text-sm font-light text-gray-600 leading-relaxed">
                {exp.bullets && exp.bullets.join(' ')}
              </p>
            </div>
          ))}
        </section>
      )}

      {resumeData?.education && resumeData.education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-gray-400 text-center">
            Education
          </h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-4 flex justify-between items-baseline">
              <div>
                <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                <div className="text-sm text-gray-500">{edu.institution}</div>
              </div>
              <div className="text-xs text-gray-400">{edu.year}</div>
            </div>
          ))}
        </section>
      )}

      {resumeData?.skills && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-6 text-gray-400 text-center">
            Skills
          </h2>
          <div className="text-sm font-light text-center text-gray-600 leading-relaxed max-w-lg mx-auto">
            {resumeData.skills.technical && resumeData.skills.technical.join(' • ')}
            {resumeData.skills.technical && resumeData.skills.soft && ' • '}
            {resumeData.skills.soft && resumeData.skills.soft.join(' • ')}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalistClean;
