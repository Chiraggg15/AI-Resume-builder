import React from 'react';

const ModernTwoColumn = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#7C3AED', fontFamily = 'Inter, sans-serif' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#333',
    lineHeight: 1.5,
  };

  return (
    <div className="bg-white max-w-4xl mx-auto shadow-sm flex overflow-hidden min-h-[1056px]" style={styles}>
      {/* Sidebar */}
      <aside className="w-1/3 text-white p-8" style={{ backgroundColor: accentColor }}>
        <h1 className="text-3xl font-bold mb-2 uppercase break-words">
          {resumeData?.contact?.name || 'Your Name'}
        </h1>
        
        <div className="mb-8 text-sm opacity-90 flex flex-col gap-2">
          {resumeData?.contact?.email && <div>{resumeData.contact.email}</div>}
          {resumeData?.contact?.phone && <div>{resumeData.contact.phone}</div>}
          {resumeData?.contact?.location && <div>{resumeData.contact.location}</div>}
          {resumeData?.contact?.linkedin && <div className="break-all">{resumeData.contact.linkedin}</div>}
          {resumeData?.contact?.github && <div className="break-all">{resumeData.contact.github}</div>}
        </div>

        {resumeData?.skills && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider border-b border-white/30 pb-2">
              Skills
            </h2>
            {resumeData.skills.technical && resumeData.skills.technical.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2 opacity-80 uppercase text-xs">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.technical.map((skill, i) => (
                    <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2 opacity-80 uppercase text-xs">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.soft.map((skill, i) => (
                    <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {resumeData?.education && resumeData.education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-wider border-b border-white/30 pb-2">
              Education
            </h2>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-bold text-sm">{edu.degree}</div>
                <div className="text-xs opacity-90 mb-1">{edu.institution}</div>
                <div className="text-xs opacity-75">{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8 bg-white">
        {resumeData?.summary && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-3 border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Profile
            </h2>
            <p className="text-sm text-gray-700">{resumeData.summary}</p>
          </section>
        )}

        {resumeData?.experience && resumeData.experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4 border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Experience
            </h2>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="mb-5 relative pl-4 border-l-2" style={{ borderColor: accentColor }}>
                <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1 bg-white border-2" style={{ borderColor: accentColor }}></div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{exp.title}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100" style={{ color: accentColor }}>
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                <div className="font-medium text-gray-600 mb-2 text-sm">{exp.company} • {exp.location}</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="mb-1">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
        
        {resumeData?.projects && resumeData.projects.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4 border-b-2 pb-1" style={{ borderColor: accentColor, color: accentColor }}>
              Projects
            </h2>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-bold text-gray-800">{proj.name}</div>
                <p className="text-sm text-gray-700 mb-1">{proj.description}</p>
                {proj.technologies && (
                  <div className="text-xs text-gray-500 italic">Tech: {proj.technologies.join(', ')}</div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default ModernTwoColumn;
