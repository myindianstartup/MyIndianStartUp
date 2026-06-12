import React from 'react';
import { 
  Landmark, 
  GraduationCap, 
  ShoppingBag, 
  Boxes, 
  Package, 
  Cloud, 
  HeartPulse, 
  Brain, 
  Leaf, 
  Zap 
} from 'lucide-react';

const Industries = () => {
  const industries = [
    { title: 'Fintech', icon: <Landmark className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-100' },
    { title: 'Edtech', icon: <GraduationCap className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100' },
    { title: 'E-commerce', icon: <ShoppingBag className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-50 border-pink-100' },
    { title: 'Web3', icon: <Boxes className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50 border-orange-100' },
    { title: 'D2C', icon: <Package className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100' },
    { title: 'SaaS', icon: <Cloud className="w-5 h-5 text-sky-600" />, bg: 'bg-sky-50 border-sky-100' },
    { title: 'Healthcare', icon: <HeartPulse className="w-5 h-5 text-red-600" />, bg: 'bg-red-50 border-red-100' },
    { title: 'AI & DeepTech', icon: <Brain className="w-5 h-5 text-slate-700" />, bg: 'bg-slate-50 border-slate-200' },
    { title: 'Agritech', icon: <Leaf className="w-5 h-5 text-green-600" />, bg: 'bg-green-50 border-green-100' },
    { title: 'CleanTech', icon: <Zap className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50 border-yellow-100' }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
      {industries.map((ind, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 transition-all duration-300 text-left flex flex-col justify-between min-h-[140px]"
        >
          <div className={`w-10 h-10 rounded-2xl ${ind.bg} flex items-center justify-center mb-4 flex-shrink-0`}>
            {ind.icon}
          </div>
          <h3 className="text-sm font-black text-slate-800 leading-tight">{ind.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Industries;
