import React from 'react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';

const Membership = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'Starter',
      desc: 'Explore connections in the Indian startup and creator networks.',
      price: '0',
      period: 'forever',
      features: [
        { text: 'Basic Profile Listing', active: true },
        { text: 'Ecosystem Search Access', active: true },
        { text: 'Direct messaging (3/mo)', active: true },
        { text: 'CA Legal Consultations', active: false },
        { text: 'Verification Trust Tick', active: false }
      ],
      btnText: 'Join Free',
      popular: false
    },
    {
      name: 'Annual Member',
      desc: 'All-inclusive matchmaking, premium resources, and direct CA consultations.',
      price: '999',
      period: 'year',
      features: [
        { text: 'Featured Profile Listing', active: true },
        { text: 'Ecosystem Search Access', active: true },
        { text: 'Unlimited Direct Messaging', active: true },
        { text: 'CA Consultation Pack (2/yr)', active: true },
        { text: 'Verification Trust Tick', active: true }
      ],
      btnText: 'Start Membership',
      popular: true
    },
    {
      name: 'Enterprise',
      desc: 'Dedicated support, compliance handling, and curated introductions.',
      price: '4,999',
      period: 'year',
      features: [
        { text: 'Priority Featured Listing', active: true },
        { text: 'Ecosystem Search Access', active: true },
        { text: 'Unlimited Direct Messaging', active: true },
        { text: 'Unlimited CA Consultations', active: true },
        { text: 'Dedicated CA Account Exec', active: true }
      ],
      btnText: 'Talk to Sales',
      popular: false
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {plans.map((plan, idx) => (
        <div 
          key={idx}
          className={`bg-white border shadow-sm rounded-3xl p-8 md:p-10 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative ${
            plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
              Best Value
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6 min-height-[36px]">{plan.desc}</p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-bold text-slate-900">Rs</span>
              <span className="text-5xl font-black tracking-tight text-slate-950 font-heading">{plan.price}</span>
              <span className="text-slate-500 font-bold text-xs">/{plan.period}</span>
            </div>

            <ul className="flex flex-col gap-4 mb-8">
              {plan.features.map((feat, fIdx) => (
                <li key={fIdx} className={`flex items-center gap-3 text-sm ${feat.active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                  {feat.active ? (
                    <ShieldCheck size={16} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <X size={16} className="text-slate-300 flex-shrink-0" />
                  )}
                  <span className="font-semibold">{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan(plan)}
            data-testid={`pricing-btn-${plan.name.toLowerCase().replace(' ', '-')}`}
            className={`w-full py-4 text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:scale-[1.01] transform transition-transform ${
              plan.popular 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]' 
                : 'border-2 border-slate-200 text-slate-900 hover:border-slate-900'
            }`}
          >
            <span>{plan.btnText}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Membership;
