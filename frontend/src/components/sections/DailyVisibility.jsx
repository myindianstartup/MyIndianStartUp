import React from 'react';
import { FileSpreadsheet, Sparkles, BarChart3, FileText, ShieldCheck, Users } from 'lucide-react';

const DailyVisibility = () => {
  const nodes = [
    { label: 'GST', icon: <FileSpreadsheet size={16} />, style: { top: '12%', left: '50%' }, bgClass: 'bg-blue-50 border border-blue-100 text-blue-600', testid: 'dial-gst' },
    { label: 'PR', icon: <Sparkles size={16} />, style: { top: '31%', left: '83%' }, bgClass: 'bg-orange-50 border border-orange-100 text-orange-500', testid: 'dial-pr' },
    { label: 'Analytics', icon: <BarChart3 size={16} />, style: { top: '69%', left: '83%' }, bgClass: 'bg-teal-50 border border-teal-100 text-teal-600', testid: 'dial-analytics' },
    { label: 'Agreements', icon: <FileText size={16} />, style: { top: '88%', left: '50%' }, bgClass: 'bg-purple-50 border border-purple-100 text-purple-600', testid: 'dial-agreements' },
    { label: 'Trademark', icon: <ShieldCheck size={16} />, style: { top: '69%', left: '17%' }, bgClass: 'bg-indigo-50 border border-indigo-100 text-indigo-600', testid: 'dial-trademark' },
    { label: 'Consulting', icon: <Users size={16} />, style: { top: '31%', left: '17%' }, bgClass: 'bg-emerald-50 border border-emerald-100 text-emerald-600', testid: 'dial-consulting' }
  ];

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center mt-6">
      
      {/* Background SVG connecting rays and circle */}
      <svg className="absolute inset-0 w-full h-full text-slate-200 pointer-events-none" viewBox="0 0 400 400" fill="none">
        {/* Outer dotted circle */}
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" className="opacity-80" />
        
        {/* Connecting lines / spokes */}
        <line x1="200" y1="200" x2="200" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="200" x2="330" y2="125" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="200" x2="330" y2="275" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="200" x2="200" y2="350" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="200" x2="70" y2="275" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="200" y1="200" x2="70" y2="125" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      {/* Center Circle Dial */}
      <div className="relative z-10 w-28 h-28 rounded-full bg-white border border-slate-200/80 shadow-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300">
        <span className="text-3xl font-black text-slate-950 font-heading">24</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Perks active</span>
      </div>

      {/* Surrounding Nodes */}
      {nodes.map((node, idx) => (
        <div
          key={idx}
          style={node.style}
          data-testid={node.testid}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5"
        >
          <div className={`w-11 h-11 rounded-2xl ${node.bgClass} flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer`}>
            {node.icon}
          </div>
          <span className="text-[9px] font-black tracking-wider uppercase text-slate-500 bg-white/90 border border-slate-100 shadow-sm px-1.5 py-0.5 rounded-md">
            {node.label}
          </span>
        </div>
      ))}

    </div>
  );
};

export default DailyVisibility;
