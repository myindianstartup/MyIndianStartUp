import React from 'react';

const IndiaCoverage = () => {
  const cities = [
    { name: 'Delhi NCR', top: '28%', left: '46%', testid: 'map-pin-delhi', color: 'blue' },
    { name: 'Mumbai', top: '60%', left: '33%', testid: 'map-pin-mumbai', color: 'orange' },
    { name: 'Bengaluru', top: '80%', left: '48%', testid: 'map-pin-bengaluru', color: 'blue' },
    { name: 'Hyderabad', top: '65%', left: '53%', testid: 'map-pin-hyderabad', color: 'blue' },
    { name: 'Chennai', top: '83%', left: '56%', testid: 'map-pin-chennai', color: 'orange' },
    { name: 'Kolkata', top: '51%', left: '78%', testid: 'map-pin-kolkata', color: 'orange' },
    { name: 'Ahmedabad', top: '48%', left: '29%', testid: 'map-pin-ahmedabad', color: 'blue' }
  ];

  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto items-center">
      
      {/* Top side stats */}
      <div className="grid grid-cols-3 gap-8 md:gap-16 w-full text-center border-b border-slate-100 pb-10">
        <div className="flex flex-col items-center">
          <span className="block text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-none mb-2 font-heading">10k+</span>
          <span className="block text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest max-w-[120px]">Startups Managed</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-100 px-4">
          <span className="block text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-none mb-2 font-heading">28+</span>
          <span className="block text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest max-w-[120px]">States Represented</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="block text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 leading-none mb-2 font-heading">150+</span>
          <span className="block text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest max-w-[120px]">Chartered Accountants</span>
        </div>
      </div>

      {/* Map block */}
      <div className="w-full flex justify-center items-center">
        <div className="relative w-full max-w-[400px] aspect-[10/11] bg-gradient-to-b from-[#F8FAFC]/50 to-[#F8FAFC]/10 border border-slate-200/80 shadow-sm rounded-3xl p-6 overflow-hidden flex items-center justify-center">
          
          {/* Abstract background vector mesh outline for India */}
          <svg className="w-full h-full text-blue-500/10 opacity-70" viewBox="0 0 320 350" fill="currentColor">
            <path d="M 160,30 L 195,50 L 195,75 L 225,95 L 215,120 L 245,135 L 280,140 L 280,180 L 310,185 L 265,215 L 250,240 L 220,250 L 195,300 L 170,340 L 165,348 L 150,330 L 145,300 L 115,240 L 105,210 L 85,195 L 75,165 L 80,140 L 120,130 L 140,100 L 130,60 Z" />
            <path
              d="M 160,100 L 105,210 M 105,210 L 165,300 M 165,300 L 195,300 M 195,300 L 115,240 M 160,100 L 280,180 M 280,180 L 195,300"
              stroke="rgba(37, 99, 235, 0.08)"
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
            />
          </svg>

          {/* City pulsing markers absolute positioning overlay */}
          {cities.map((city, idx) => (
            <div 
              key={idx}
              data-testid={city.testid}
              style={{ top: city.top, left: city.left }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
            >
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  city.color === 'orange' ? 'bg-orange-400' : 'bg-blue-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  city.color === 'orange' ? 'bg-orange-500' : 'bg-blue-600'
                }`} />
              </span>
              <span className="text-[9px] font-black text-slate-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 whitespace-nowrap leading-none">
                {city.name}
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default IndiaCoverage;
