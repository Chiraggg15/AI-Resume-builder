import React, { useRef, useState, useEffect } from 'react';
import { Lock, CheckCircle, Layout } from 'lucide-react';
import { TEMPLATE_REGISTRY } from './templates';

const TemplateCard = ({ template, onSelect, isPremiumUser, resumeData }) => {
  const isLocked = template.tier === 'premium' && !isPremiumUser;
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Standard A4 width is 210mm. At 96 DPI, it's roughly 794px.
        // We calculate scale to fit the 794px component into our container width.
        setScale(containerRef.current.clientWidth / 794);
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const templateConfig = TEMPLATE_REGISTRY.find(t => t.id === template.id);
  const TemplateComponent = templateConfig?.component;
  const customizations = {
    accentColor: template.accentColorDefault,
    fontFamily: template.id === 'ats-maximizer' ? 'Arial, sans-serif' : 'Inter, sans-serif'
  };

  return (
    <div 
      className={`group flex flex-col rounded-xl overflow-hidden border transition-all duration-300 bg-zinc-900/50
        ${isLocked ? 'border-zinc-800 opacity-90' : 'border-zinc-800 hover:border-emerald-500 hover:shadow-xl cursor-pointer hover:-translate-y-1'}`}
      onClick={() => !isLocked && onSelect(template)}
    >
      {/* Thumbnail Container */}
      <div 
        ref={containerRef}
        className="relative aspect-[210/297] bg-zinc-800 overflow-hidden"
      >
        <div className={`w-full h-full transition-transform duration-500 group-hover:scale-105 origin-top ${isLocked ? 'blur-[2px] grayscale-[0.5]' : ''}`}>
          {TemplateComponent ? (
            <div className="absolute top-0 left-0 w-[794px] h-[1123px] origin-top-left pointer-events-none select-none bg-white" style={{ transform: `scale(${scale})` }}>
              <TemplateComponent resumeData={resumeData} customizations={customizations} />
            </div>
          ) : (
            <img 
              src={template.thumbnail} 
              alt={template.name} 
              className="w-full h-full object-cover object-top" 
            />
          )}
        </div>
        
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
          {template.tier === 'premium' && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium
            </span>
          )}
          {template.tier === 'free' && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Free
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-zinc-800 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> ATS: {template.atsScore}
          </span>
        </div>

        {/* Hover Action */}
        {!isLocked && (
          <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 pointer-events-none">
            <button className="bg-zinc-950 text-emerald-400 border border-emerald-500/50 font-semibold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 pointer-events-auto">
              <Layout className="w-4 h-4" /> Preview
            </button>
          </div>
        )}
        
        {isLocked && (
          <div className="absolute inset-0 bg-zinc-900/80 flex flex-col items-center justify-center text-white p-4 text-center z-20">
            <div className="bg-white/10 p-3 rounded-full mb-3 backdrop-blur-md">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="font-bold mb-1">Premium Template</h4>
            <p className="text-xs text-zinc-300">Upgrade to unlock this design</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow border-t border-zinc-800">
        <h3 className="font-bold text-white mb-1">{template.name}</h3>
        <p className="text-xs text-zinc-400 line-clamp-2">{template.description}</p>
      </div>
    </div>
  );
};

export default TemplateCard;
