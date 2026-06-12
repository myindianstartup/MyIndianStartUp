import React from 'react';
import { Check, X } from 'lucide-react';

const Comparison = () => {
  const comparisonRows = [
    { feature: 'Direct CA-assigned fulfillment', startup: true, broker: false, freelance: false },
    { feature: 'Dual-sided marketplace access', startup: true, broker: false, freelance: false },
    { feature: 'Legal agreement automation', startup: true, broker: false, freelance: false },
    { feature: 'Dedicated client dashboard', startup: true, broker: false, freelance: false },
    { feature: 'Rs 999 annual membership pricing', startup: true, broker: false, freelance: false },
    { feature: 'Direct chat with professionals', startup: true, broker: false, freelance: false }
  ];

  return (
    <div className="overflow-x-auto w-full bg-white border border-slate-200/80 shadow-sm rounded-3xl max-w-4xl mx-auto">
      <table className="w-full border-collapse text-left text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200">
            <th className="p-4 md:p-5 font-bold text-slate-900 w-2/5">Key Features</th>
            <th className="p-4 md:p-5 font-black text-blue-600 bg-blue-50/40 border-x border-blue-100/60 w-1/5 text-center">
              Startup Verse
            </th>
            <th className="p-4 md:p-5 font-bold text-slate-400 w-1/5 text-center">Broker Agencies</th>
            <th className="p-4 md:p-5 font-bold text-slate-400 w-1/5 text-center">Freelance Portals</th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
              <td className="p-4 md:p-5 font-bold text-slate-800">{row.feature}</td>
              <td className="p-4 md:p-5 bg-blue-50/20 border-x border-blue-100/40 text-center">
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                  <Check size={14} className="stroke-[3]" />
                </div>
              </td>
              <td className="p-4 md:p-5 text-center">
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-500">
                  <X size={14} className="stroke-[3]" />
                </div>
              </td>
              <td className="p-4 md:p-5 text-center">
                <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-500">
                  <X size={14} className="stroke-[3]" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Comparison;
