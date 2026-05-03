import React from 'react';

const ExecutiveTimeline = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#1E293B', fontFamily = 'Playfair Display, serif' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#333',
    lineHeight: 1.6,
  };

  return (
    <div className="bg-[#FAF9F6] p-10 max-w-4xl mx-auto shadow-sm min-h-[1056px] relative" style={styles}>
      {/* Subtle monogram watermark */}
      <div className="absolute top-8 right-12 text-8xl opacity-5 font-bold pointer-events-none" style={{ color: accentColor }}>
        {resumeData?.contact?.name ? resumeData.contact.name.charAt(0) : ''}
      </div>

      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold mb-3 tracking-wide" style={{ color: accentColor }}>
          {resumeData?.contact?.name || 'Your Name'}
        </h1>
        <div className="text-xs uppercase tracking-widest flex flex-wrap justify-center gap-4 text-gray-500">
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone}</span>}
          {resumeData?.contact?.location && <span>{resumeData.contact.location}</span>}
          {resumeData?.contact?.linkedin && <span>{resumeData.contact.linkedin}</span>}
        </div>
      </header>

      {resumeData?.summary && (
        <section className="mb-10 text-center px-8">
          <p className="text-sm italic text-gray-700 leading-relaxed">"{resumeData.summary}"</p>
        </section>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-center border-b pb-2" style={{ borderColor: accentColor, color: accentColor }}>
            Executive Experience
          </h2>
          <div className="relative pl-6 border-l" style={{ borderColor: accentColor }}>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="mb-8 relative">
                <div className="absolute w-2 h-2 rounded-full -left-[29px] top-2" style={{ backgroundColor: accentColor }}></div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                  {exp.startDate} – {exp.endDate}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{exp.title}</h3>
                <div className="text-sm font-medium mb-2" style={{ color: accentColor }}>{exp.company} | {exp.location}</div>
                <ul className="list-disc list-outside ml-4 text-sm text-gray-700">
                  {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="mb-1">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {resumeData?.education && resumeData.education.length > 0 && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ borderColor: accentColor, color: accentColor }}>
              Education
            </h2>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                <div className="text-sm text-gray-600">{edu.institution}</div>
                <div className="text-xs text-gray-500 mt-1">{edu.year}</div>
              </div>
            ))}
          </section>
        )}

        {resumeData?.skills && (
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4 border-b pb-2" style={{ borderColor: accentColor, color: accentColor }}>
              Core Competencies
            </h2>
            <div className="text-sm text-gray-700">
              {resumeData.skills.technical && resumeData.skills.technical.length > 0 && (
                <div className="mb-2">
                  <strong>Technical:</strong> {resumeData.skills.technical.join(', ')}
                </div>
              )}
              {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
                <div className="mb-2">
                  <strong>Soft Skills:</strong> {resumeData.skills.soft.join(', ')}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ExecutiveTimeline;
