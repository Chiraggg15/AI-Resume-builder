import React from 'react';

const CreativePortfolio = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#EC4899', fontFamily = 'Poppins, sans-serif' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#333',
  };

  return (
    <div className="bg-white max-w-4xl mx-auto shadow-sm min-h-[1056px]" style={styles}>
      <header className="p-10 text-white" style={{ backgroundColor: accentColor }}>
        <h1 className="text-5xl font-black mb-4 tracking-tighter">
          {resumeData?.contact?.name || 'Your Name'}
        </h1>
        <div className="text-sm font-medium flex flex-wrap gap-x-6 gap-y-2 opacity-90">
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone}</span>}
          {resumeData?.contact?.location && <span>{resumeData.contact.location}</span>}
          {resumeData?.contact?.portfolio && <span>{resumeData.contact.portfolio}</span>}
        </div>
      </header>

      <div className="flex">
        {/* Left Panel - Experience */}
        <div className="w-7/12 p-8 border-r border-gray-100">
          {resumeData?.summary && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3" style={{ color: accentColor }}>Profile</h2>
              <p className="text-sm leading-relaxed text-gray-600 font-medium">
                {resumeData.summary}
              </p>
            </section>
          )}

          {resumeData?.experience && resumeData.experience.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-5" style={{ color: accentColor }}>Experience</h2>
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800">{exp.title}</h3>
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    {exp.company} / {exp.startDate} - {exp.endDate}
                  </div>
                  <ul className="list-square ml-4 text-sm text-gray-600">
                    {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="mb-1">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Panel - Skills & Edu */}
        <div className="w-5/12 p-8 bg-gray-50">
          {resumeData?.skills && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-5" style={{ color: accentColor }}>Expertise</h2>
              
              {resumeData.skills.technical && resumeData.skills.technical.map((skill, i) => (
                <div key={i} className="mb-3">
                  <div className="text-xs font-bold uppercase mb-1 text-gray-700">{skill}</div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: accentColor, 
                        width: `${Math.max(40, 100 - (i * 10))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-2">Superpowers</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.soft.map((skill, i) => (
                      <span key={i} className="text-xs font-medium border border-gray-300 px-2 py-1 rounded-full text-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {resumeData?.projects && resumeData.projects.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>Projects</h2>
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="mb-4">
                  <h3 className="font-bold text-gray-800 text-sm">{proj.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{proj.description}</p>
                </div>
              ))}
            </section>
          )}

          {resumeData?.education && resumeData.education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4" style={{ color: accentColor }}>Education</h2>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">{edu.degree}</h3>
                  <div className="text-xs text-gray-600">{edu.institution}</div>
                  <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativePortfolio;
