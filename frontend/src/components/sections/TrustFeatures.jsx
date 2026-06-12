import React from 'react';
import { Briefcase, Calculator, ShieldCheck, FileSpreadsheet, FileCheck } from 'lucide-react';

const TrustFeatures = () => {
  const features = [
    {
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      title: 'Business Registration',
      description: 'Incorporate Pvt Ltd, LLP, OPC, or Partnerships.',
      testid: 'trust-card-incorporation'
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-blue-600" />,
      title: 'GST Filings',
      description: 'Fast registration, returns, and monthly compliances.',
      testid: 'trust-card-gst'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: 'IPR & Trademarks',
      description: 'Secure patents, logo rights, and registrations.',
      testid: 'trust-card-trademark'
    },
    {
      icon: <Calculator className="w-6 h-6 text-blue-600" />,
      title: 'Taxation Filings',
      description: 'Compute returns, TDS filings, and annual audits.',
      testid: 'trust-card-tax'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-blue-600" />,
      title: 'Startup India',
      description: 'Acquire DIPP tax exemptions and benefits.',
      testid: 'trust-card-dipp'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {features.map((feat, idx) => (
        <div 
          key={idx} 
          data-testid={feat.testid}
          className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col text-left items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            {feat.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">{feat.title}</h3>
            <p className="text-xs text-slate-500 leading-normal font-semibold">{feat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustFeatures;
