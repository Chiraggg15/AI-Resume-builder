import React from 'react';
import { TEMPLATE_REGISTRY } from './templates';

const TemplateRenderer = ({ templateId, resumeData, customizations }) => {
  const templateConfig = TEMPLATE_REGISTRY.find(t => t.id === templateId) || TEMPLATE_REGISTRY[0];
  const TemplateComponent = templateConfig.component;

  if (!resumeData) return null;

  return (
    <div id="cv-preview-container" className="w-full h-full overflow-auto bg-zinc-900/50 p-4 lg:p-8 flex justify-center custom-scrollbar">
      {/* Container with a fixed aspect ratio or fixed max-width scaling for A4 */}
      <div className="w-[210mm] min-h-[297mm] shadow-lg print:shadow-none print:w-auto print:h-auto print:m-0 bg-white origin-top shrink-0 transition-transform duration-300">
        <TemplateComponent resumeData={resumeData} customizations={customizations} />
      </div>
    </div>
  );
};

export default TemplateRenderer;
