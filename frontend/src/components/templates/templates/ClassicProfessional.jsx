import React from 'react';

const ClassicProfessional = ({ resumeData, customizations = {} }) => {
  const { accentColor = '#2563EB', fontFamily = 'Georgia' } = customizations;

  const styles = {
    '--accent': accentColor,
    '--font-body': fontFamily,
    fontFamily: `var(--font-body)`,
    color: '#333',
    lineHeight: 1.5,
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-sm" style={styles}>
      <header className="text-center mb-6 border-b-2 pb-4" style={{ borderColor: accentColor }}>
        <h1 className="text-4xl font-bold mb-2 uppercase" style={{ color: accentColor }}>
          {resumeData?.contact?.name || 'Your Name'}
        </h1>
        <div className="text-sm flex flex-wrap justify-center gap-4 text-gray-600">
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone}</span>}
          {resumeData?.contact?.location && <span>{resumeData.contact.location}</span>}
          {resumeData?.contact?.linkedin && <span>{resumeData.contact.linkedin}</span>}
          {resumeData?.contact?.github && <span>{resumeData.contact.github}</span>}
        </div>
      </header>

      {resumeData?.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1" style={{ color: accentColor }}>
            Professional Summary
          </h2>
          <p className="text-sm">{resumeData.summary}</p>
        </section>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1" style={{ color: accentColor }}>
            Professional Experience
          </h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800">{exp.title}</h3>
                <span className="text-sm text-gray-600 font-medium">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="italic text-gray-700">{exp.company}</span>
                <span className="text-sm text-gray-500">{exp.location}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="mb-1">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resumeData?.education && resumeData.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1" style={{ color: accentColor }}>
            Education
          </h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-3 flex justify-between items-baseline">
              <div>
                <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                <div className="italic text-gray-700">{edu.institution}</div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-600 block">{edu.year}</span>
                {edu.gpa && <span className="text-sm text-gray-500 block">GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {resumeData?.skills && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1" style={{ color: accentColor }}>
            Skills
          </h2>
          <div className="text-sm">
            {resumeData.skills.technical && resumeData.skills.technical.length > 0 && (
              <div className="mb-1">
                <span className="font-bold">Technical: </span>
                {resumeData.skills.technical.join(', ')}
              </div>
            )}
            {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
              <div className="mb-1">
                <span className="font-bold">Soft Skills: </span>
                {resumeData.skills.soft.join(', ')}
              </div>
            )}
            {resumeData.skills.languages && resumeData.skills.languages.length > 0 && (
              <div>
                <span className="font-bold">Languages: </span>
                {resumeData.skills.languages.join(', ')}
              </div>
            )}
          </div>
        </section>
      )}

      {resumeData?.certifications && resumeData.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2 border-b border-gray-300 pb-1" style={{ color: accentColor }}>
            Certifications
          </h2>
          <ul className="list-disc list-inside text-sm">
            {resumeData.certifications.map((cert, idx) => (
              <li key={idx}>
                <span className="font-bold">{cert.name}</span> — {cert.issuer} ({cert.year})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ClassicProfessional;
