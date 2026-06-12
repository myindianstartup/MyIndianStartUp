import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  UsersRound, 
  Award, 
  TrendingUp, 
  Star, 
  Building, 
  FileSpreadsheet, 
  FileCheck 
} from 'lucide-react';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredBar, setHoveredBar] = useState(null);
  const navigate = useNavigate();

  const chartData = [
    { month: 'Jan', value: 340, value2: 210 },
    { month: 'Feb', value: 450, value2: 290 },
    { month: 'Mar', value: 590, value2: 380 },
    { month: 'Apr', value: 820, value2: 480 },
    { month: 'May', value: 950, value2: 670 },
    { month: 'Jun', value: 1200, value2: 890 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className="pt-32 pb-20 overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-white relative">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            className="lg:col-span-6 flex flex-col items-start text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50/50 text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-6 animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>LIVE ON PRODUCT HUNT 🚀</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl tracking-tighter leading-[1.05] font-black text-slate-900 mb-6"
              data-testid="hero-title"
            >
              India's biggest Business & <br/>
              <span className="text-orange-500">Creator</span> collaboration platform.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg leading-relaxed text-slate-600 mb-8 max-w-lg"
              data-testid="hero-subtitle"
            >
              Launch your company, match with top creators, manage your compliance, GST, filings, and scale your brand with CA-managed assurance.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-8"
            >
              <button 
                onClick={() => navigate('/business-verse')}
                className="bg-blue-600 text-white font-semibold rounded-full px-8 py-4 hover:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex items-center gap-2 hover:scale-[1.02] transform transition-transform"
                data-testid="hero-cta-business"
              >
                <span>Start Business</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => navigate('/creator-verse')}
                className="bg-orange-500 text-white font-semibold rounded-full px-8 py-4 hover:bg-orange-600 transition-colors shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] flex items-center gap-2 hover:scale-[1.02] transform transition-transform"
                data-testid="hero-cta-creator"
              >
                <span>Join Creator</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <div className="flex text-yellow-400 gap-0.5">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span className="text-xs text-slate-500 font-bold tracking-tight">
                Trustpilot <span className="text-slate-300 mx-1">|</span> 5 Star review on Google Map
              </span>
            </motion.div>
          </motion.div>

          {/* Right Abstract Dashboard Mockup Column */}
          <motion.div 
            className="lg:col-span-6 w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-full bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden hover:-translate-y-1 hover:border-blue-200 transition-all duration-300">
              
              {/* Window Header */}
              <div className="h-11 bg-slate-50 border-b border-slate-200/60 flex items-center px-4 justify-between">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] font-bold tracking-tight text-slate-400">dashboard.myindianstartup.com</span>
                <div className="w-8" />
              </div>

              {/* Dashboard Content Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 md:min-height-[400px]">
                
                {/* Sidebar */}
                <div className="md:col-span-4 bg-slate-50/50 p-4 border-r border-slate-100 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
                  {[
                    { id: 'overview', icon: <LayoutDashboard size={14} />, label: 'Overview', testid: 'hero-dashboard-tab-overview' },
                    { id: 'collabs', icon: <Users size={14} />, label: 'Collabs', testid: 'hero-dashboard-tab-collabs' },
                    { id: 'analytics', icon: <BarChart3 size={14} />, label: 'Analytics', testid: 'hero-dashboard-tab-analytics' },
                    { id: 'settings', icon: <Settings size={14} />, label: 'Settings', testid: 'hero-dashboard-tab-settings' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      data-testid={tab.testid}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-blue-50 text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Dashboard body area */}
                <div className="md:col-span-8 p-6 text-left flex flex-col gap-6">
                  {activeTab === 'overview' && (
                    <>
                      {/* Mini stats cards grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[9px] font-bold uppercase tracking-wider">
                            <UsersRound size={10} className="text-blue-500" />
                            <span>Collabs</span>
                          </div>
                          <span className="text-base font-black text-slate-900 leading-none">24</span>
                          <div className="text-[8px] font-bold text-teal-600 mt-1">+12% wk</div>
                        </div>

                        <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[9px] font-bold uppercase tracking-wider">
                            <TrendingUp size={10} className="text-orange-500" />
                            <span>Reach</span>
                          </div>
                          <span className="text-base font-black text-slate-900 leading-none">+48%</span>
                          <div className="text-[8px] font-bold text-teal-600 mt-1">+8.2% mo</div>
                        </div>

                        <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[9px] font-bold uppercase tracking-wider">
                            <Award size={10} className="text-teal-500" />
                            <span>Rate</span>
                          </div>
                          <span className="text-base font-black text-slate-900 leading-none">99.2%</span>
                          <div className="text-[8px] font-bold text-slate-400 mt-1">Verified</div>
                        </div>
                      </div>

                      {/* Bar chart grid */}
                      <div className="border border-slate-100 p-4 rounded-2xl flex-1 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800">Engagement Graph</h4>
                          <div className="flex gap-3 text-[9px] font-bold text-slate-400">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>Business</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              <span>Creator</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive SVG Bar chart */}
                        <div className="relative h-28 w-full mt-2">
                          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            <line x1="20" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="20" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="20" y1="100" x2="380" y2="100" stroke="#e2e8f0" strokeWidth="1" />

                            {chartData.map((d, i) => {
                              const x = 35 + i * 60;
                              const w = 12;
                              const g = 3;
                              const h1 = (d.value / 1200) * 80;
                              const h2 = (d.value2 / 1200) * 80;
                              const y1 = 100 - h1;
                              const y2 = 100 - h2;

                              return (
                                <g key={d.month}>
                                  <rect
                                    x={x}
                                    y={y1}
                                    width={w}
                                    height={h1}
                                    fill="url(#hBlue)"
                                    rx="2"
                                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                    onMouseEnter={() => setHoveredBar({ index: i, type: 'Business', val: d.value, x, y: y1 })}
                                    onMouseLeave={() => setHoveredBar(null)}
                                  />
                                  <rect
                                    x={x + w + g}
                                    y={y2}
                                    width={w}
                                    height={h2}
                                    fill="url(#hOrange)"
                                    rx="2"
                                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                                    onMouseEnter={() => setHoveredBar({ index: i, type: 'Creator', val: d.value2, x: x + w + g, y: y2 })}
                                    onMouseLeave={() => setHoveredBar(null)}
                                  />
                                  <text x={x + w} y="115" textAnchor="middle" fontSize="8" fontWeight="600" fill="#94a3b8">
                                    {d.month}
                                  </text>
                                </g>
                              );
                            })}
                            <defs>
                              <linearGradient id="hBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#2563eb" />
                              </linearGradient>
                              <linearGradient id="hOrange" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb923c" />
                                <stop offset="100%" stopColor="#f97316" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* Chart hover tooltip */}
                          {hoveredBar && (
                            <div
                              style={{
                                position: 'absolute',
                                left: `${(hoveredBar.x / 400) * 100}%`,
                                top: `${(hoveredBar.y / 120) * 100 - 30}%`,
                                transform: 'translateX(-30%)'
                              }}
                              className="bg-slate-900 text-white px-2 py-1 rounded-md text-[8px] font-bold pointer-events-none z-20 shadow-md whitespace-nowrap"
                            >
                              {hoveredBar.type}: {hoveredBar.val} views
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'collabs' && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-slate-800">Ecosystem Collaborations</h4>
                      {[
                        { title: 'TechLabs Inc.', desc: 'Backend development contract request.', label: 'In Review', style: 'bg-blue-50 text-blue-600' },
                        { title: 'Aman Vashisht', desc: 'YouTube brand sponsorship contract signed.', label: 'Approved', style: 'bg-teal-50 text-teal-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-bold text-slate-800">{item.title}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.style}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-slate-800">Growth Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl text-center">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Follower Growth</span>
                          <span className="block text-xl font-black text-slate-950 mt-1">14.2k</span>
                          <span className="text-[9px] font-bold text-teal-600 mt-1 inline-block">+22.4% MoM</span>
                        </div>
                        <div className="bg-[#F8FAFC] border border-slate-100 p-4 rounded-2xl text-center">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Conversions</span>
                          <span className="block text-xl font-black text-slate-950 mt-1">4.82%</span>
                          <span className="text-[9px] font-bold text-teal-600 mt-1 inline-block">+1.2% MoM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-slate-800">Settings & Badges</h4>
                      <div className="border border-slate-100 p-4 rounded-2xl flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-semibold">Verification badge</span>
                          <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
                          <span className="text-slate-500 font-semibold">Plan tier</span>
                          <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Premium</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Services Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-20 border-t border-slate-100 pt-10"
        >
          {[
            { label: 'Incorporation & Compliance', icon: <Building size={16} className="text-blue-600" />, testid: 'trust-card-incorporation' },
            { label: 'GST & Taxes', icon: <FileSpreadsheet size={16} className="text-blue-600" />, testid: 'trust-card-gst' },
            { label: 'Legal Agreements', icon: <FileCheck size={16} className="text-blue-600" />, testid: 'trust-card-trademark' },
            { label: 'Creator Marketplace', icon: <Users size={16} className="text-blue-600" />, testid: 'trust-card-tax' },
            { label: 'Pitch Deck & Funding', icon: <TrendingUp size={16} className="text-blue-600" />, testid: 'trust-card-dipp' }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              data-testid={item.testid}
              className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 text-left leading-tight">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
