import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: <Building className="w-6 h-6 text-blue-600" />,
      bgClass: 'bg-blue-50 border border-blue-100',
      title: 'Choose your Verse',
      desc: 'Pick between BusinessVerse to launch a company or CreatorVerse to collaborate.',
      link: '/business-verse',
      testid: 'step-card-submit'
    },
    {
      num: '02',
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      bgClass: 'bg-orange-50 border border-orange-100',
      title: 'Pick your service',
      desc: 'Access custom packages for incorporation, trademark, GST, or creator contracts.',
      link: '/pricing',
      testid: 'step-card-consult'
    },
    {
      num: '03',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      bgClass: 'bg-emerald-50 border border-emerald-100',
      title: 'Managed Fulfillment',
      desc: 'Upload documents and track CA fulfillment in your unified client dashboard.',
      link: '/contact',
      testid: 'step-card-success'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {steps.map((step, idx) => (
        <div 
          key={idx}
          data-testid={step.testid}
          className="bg-[#F8FAFC]/60 border border-slate-200/80 shadow-sm rounded-3xl p-8 md:p-10 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative text-left flex flex-col justify-between min-h-[250px]"
        >
          {/* Step numbering badge */}
          <div className="absolute top-8 right-8 text-2xl font-black text-slate-200/60 font-heading select-none">
            {step.num}
          </div>

          <div>
            <div className={`w-12 h-12 rounded-2xl ${step.bgClass} flex items-center justify-center flex-shrink-0 mb-6`}>
              {step.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
            <p className="text-xs leading-relaxed text-slate-500 font-semibold mb-6 max-w-[240px]">{step.desc}</p>
          </div>

          <Link 
            to={step.link}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors mt-auto group"
          >
            <span>Learn more</span>
            <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default HowItWorks;
