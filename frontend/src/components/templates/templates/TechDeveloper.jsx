import React from 'react';

const TechDeveloper = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#0D9488', fontFamily = 'Fira Code, monospace' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#333',
  };

  return (
    <div className="bg-white p-10 max-w-4xl mx-auto shadow-sm min-h-[1056px]" style={styles}>
      <header className="mb-8 border-b-4 pb-4" style={{ borderColor: accentColor }}>
        <h1 className="text-4xl font-bold mb-2">
          &lt;{resumeData?.contact?.name || 'Your Name'} /&gt;
        </h1>
        <div className="text-sm flex flex-wrap gap-4 text-gray-600">
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone}</span>}
          {resumeData?.contact?.github && <span className="font-bold" style={{ color: accentColor }}>github.com/{resumeData.contact.github.split('/').pop()}</span>}
          {resumeData?.contact?.portfolio && <span>{resumeData.contact.portfolio}</span>}
        </div>
      </header>

      {resumeData?.summary && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2 uppercase tracking-wide">/* Profile */</h2>
          <p className="text-sm text-gray-700">{resumeData.summary}</p>
        </section>
      )}

      {resumeData?.skills && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">/* Tech Stack */</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.technical && resumeData.skills.technical.map((skill, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">/* Experience */</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-900">{exp.title} <span style={{ color: accentColor }}>@ {exp.company}</span></h3>
                <span className="text-xs text-gray-500">
                  [{exp.startDate} - {exp.endDate}]
                </span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
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
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wide">/* Projects */</h2>
          <div className="grid grid-cols-2 gap-4">
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="border border-gray-200 p-4 rounded-md">
                <h3 className="font-bold text-gray-900 mb-1">{proj.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{proj.description}</p>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="text-[10px] px-1 py-0.5 bg-gray-100 rounded text-gray-500">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resumeData?.education && resumeData.education.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide">/* Education */</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-2 text-sm">
              <span className="font-bold">{edu.degree}</span>, {edu.institution} <span className="text-gray-500">({edu.year})</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default TechDeveloper;
