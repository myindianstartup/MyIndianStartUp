import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-700 to-blue-600 text-white text-center relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">
          Ready for collaboration?
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-blue-100 font-semibold mb-8 max-w-lg">
          Launch your startup Verse or match with creators today.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/business-verse')}
            className="bg-white text-blue-600 font-bold rounded-full px-8 py-4 hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 hover:scale-[1.02] transform transition-transform"
            data-testid="final-cta-business"
          >
            <span>Launch business</span>
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => navigate('/creator-verse')}
            className="bg-orange-500 text-white font-bold rounded-full px-8 py-4 hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-2 hover:scale-[1.02] transform transition-transform"
            data-testid="final-cta-creator"
          >
            <span>Match with creators</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
