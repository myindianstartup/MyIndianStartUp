import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const VerseSections = () => {
  const navigate = useNavigate();

  const businessServices = [
    'GST Registration',
    'Private Limited Co.',
    'Trademark Filing',
    'Bookkeeping'
  ];

  const creatorServices = [
    'Brand Deals',
    'Media Kits',
    'Influencer Contracts',
    'Brand Collabs'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
      
      {/* Business Verse Card */}
      <div 
        className="bg-blue-600 rounded-3xl p-8 md:p-12 text-left text-white flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[380px]"
        data-testid="verse-block-business"
      >
        <div>
          <span className="text-blue-100 text-xs font-black uppercase tracking-widest block mb-1">Ecosystem Spaces</span>
          <h3 className="text-3xl font-black tracking-tight mb-8">BusinessVerse</h3>
          
          <ul className="flex flex-col gap-4 mb-8">
            {businessServices.map((service, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-blue-50 font-semibold">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => navigate('/business-verse')}
          className="bg-white text-blue-600 font-bold rounded-full py-4 px-8 hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transform transition-transform mt-auto w-full text-center sm:w-auto self-start"
          data-testid="verse-cta-business"
        >
          <span>Launch your Business</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Creator Verse Card */}
      <div 
        className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/50 border border-amber-200/60 rounded-3xl p-8 md:p-12 text-left flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[380px]"
        data-testid="verse-block-creator"
      >
        <div>
          <span className="text-orange-600/80 text-xs font-black uppercase tracking-widest block mb-1">Ecosystem Spaces</span>
          <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-8">CreatorVerse</h3>
          
          <ul className="flex flex-col gap-4 mb-8">
            {creatorServices.map((service, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-orange-600" />
                </div>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => navigate('/creator-verse')}
          className="bg-orange-500 text-white font-bold rounded-full py-4 px-8 hover:bg-orange-600 transition-colors shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transform transition-transform mt-auto w-full text-center sm:w-auto self-start"
          data-testid="verse-cta-creator"
        >
          <span>Join the Verse</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default VerseSections;
