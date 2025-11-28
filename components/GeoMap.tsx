
import React, { useState, useMemo } from 'react';
import { HRRecord } from '../types';
import { Map, Crosshair, Satellite, Layers } from 'lucide-react';

interface GeoMapProps {
  data: HRRecord[];
}

export const GeoMap: React.FC<GeoMapProps> = ({ data }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'satellite' | 'schematic'>('satellite');

  const metrics = useMemo(() => {
    const zones = ['North', 'Central', 'South', 'Edmonton', 'Calgary'];
    return zones.map(zone => {
      const subset = data.filter(d => d.geoZone === zone);
      const totalOT = subset.reduce((acc, r) => acc + r.overtimeHours, 0);
      const totalWorked = subset.reduce((acc, r) => acc + r.workedHours, 0) || 1;
      const vacancyAvg = subset.reduce((acc, r) => acc + r.vacancyRate, 0) / (subset.length || 1);
      
      return {
        name: zone,
        riskScore: totalOT / totalWorked,
        totalOT,
        totalWorked,
        vacancyAvg,
        deptCount: subset.length
      };
    });
  }, [data]);

  const getMetric = (name: string) => metrics.find(m => m.name === name);

  const getFillColor = (name: string) => {
    const m = getMetric(name);
    if (!m) return 'rgba(255,255,255,0.1)'; 
    
    const score = m.riskScore;
    // For satellite view, we use semi-transparent overlays
    // Low Risk: Green tint
    // Med Risk: Yellow tint
    // High Risk: Red tint
    
    if (score > 0.12) return 'rgba(225, 29, 72, 0.5)'; // Rose-600 with opacity
    if (score > 0.08) return 'rgba(217, 119, 6, 0.4)'; // Amber-600 with opacity
    return 'rgba(5, 150, 105, 0.3)'; // Emerald-600 with opacity
  };

  const activeMetric = hoveredZone ? getMetric(hoveredZone) : null;

  return (
    <div className="bg-slate-900 p-0 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col relative overflow-hidden text-white group">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-slate-900/90 to-transparent">
        <div>
          <h2 className="text-lg font-bold flex items-center tracking-wide text-slate-100">
            <Satellite className="w-5 h-5 mr-2 text-sky-400" />
            SAT-VIEW
          </h2>
          <p className="text-xs text-sky-300/70 font-mono">LIVE FEED // ALBERTA_ZONES_V2</p>
        </div>
        <button 
          onClick={() => setViewMode(prev => prev === 'satellite' ? 'schematic' : 'satellite')}
          className="p-2 bg-slate-800/50 backdrop-blur rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
          title="Toggle View"
        >
          <Layers className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Floating Info HUD */}
      <div className={`transition-all duration-300 absolute right-4 top-20 z-20 ${activeMetric ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-600 p-4 rounded-lg shadow-2xl w-60">
          {activeMetric && (
            <>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
                <span className="font-mono text-lg font-bold text-sky-400">{activeMetric.name.toUpperCase()}</span>
                <div className={`w-2 h-2 rounded-full animate-pulse ${activeMetric.riskScore > 0.12 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">BURNOUT_IDX</span>
                  <span className={`${activeMetric.riskScore > 0.1 ? "text-rose-400" : "text-emerald-400"} font-bold`}>
                    {(activeMetric.riskScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VACANCY_RT</span>
                  <span className="text-slate-200">{(activeMetric.vacancyAvg * 100).toFixed(1)}%</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-slate-400">UNIT_COUNT</span>
                  <span className="text-slate-200">{activeMetric.deptCount}</span>
                </div>
                
                <div className="pt-2">
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${activeMetric.riskScore > 0.1 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(activeMetric.riskScore * 800, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full relative bg-[#0B1026]">
        {/* Background Grid for "Tech" feel */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        <svg viewBox="0 0 400 650" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <defs>
            {/* Terrain Gradient: Darker in North/East, Lighter in SW (Rockies) */}
            <linearGradient id="terrainGradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />   {/* Plains (Dark Slate) */}
              <stop offset="60%" stopColor="#334155" />  {/* Foothills */}
              <stop offset="90%" stopColor="#64748b" />  {/* Mountains (Light Slate) */}
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ALBERTA BASE MAP (Accurate Coordinates) */}
          {/* Coordinates mapped to 400x650 viewport */}
          {/* Top Right (60N, 110W): 350, 50 */}
          {/* Top Left (60N, 120W): 50, 50 */}
          {/* Bottom Right (49N, 110W): 350, 600 */}
          {/* Bottom Left (49N, 114W+Rockies): Complex path */}
          
          <g transform="translate(0, 20)">
            {/* Base Terrain Layer */}
            <path
              d="M 50,50 L 350,50 L 350,600 L 130,600 L 120,580 L 115,550 L 90,480 L 70,420 L 60,380 L 50,320 L 50,50 Z"
              fill="url(#terrainGradient)"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* NORTH ZONE */}
            <path
              d="M 50,50 L 350,50 L 350,300 L 50,300 L 50,50 Z"
              fill={getFillColor('North')}
              className="transition-all duration-300 hover:brightness-125 cursor-pointer"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
              onMouseEnter={() => setHoveredZone('North')}
              onMouseLeave={() => setHoveredZone(null)}
            />
             <text x="60" y="80" className="text-[10px] font-mono fill-white/30 pointer-events-none select-none tracking-widest">NORTH SECTOR</text>

            {/* CENTRAL ZONE */}
            <path
              d="M 50,300 L 350,300 L 350,450 L 80,450 L 70,420 L 60,380 L 50,320 L 50,300 Z"
              fill={getFillColor('Central')}
              className="transition-all duration-300 hover:brightness-125 cursor-pointer"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
              onMouseEnter={() => setHoveredZone('Central')}
              onMouseLeave={() => setHoveredZone(null)}
            />
            <text x="250" y="320" className="text-[10px] font-mono fill-white/30 pointer-events-none select-none tracking-widest">CENTRAL SECTOR</text>

            {/* SOUTH ZONE */}
            <path
              d="M 80,450 L 350,450 L 350,600 L 130,600 L 120,580 L 115,550 L 90,480 L 80,450 Z"
              fill={getFillColor('South')}
              className="transition-all duration-300 hover:brightness-125 cursor-pointer"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
              onMouseEnter={() => setHoveredZone('South')}
              onMouseLeave={() => setHoveredZone(null)}
            />
            <text x="250" y="580" className="text-[10px] font-mono fill-white/30 pointer-events-none select-none tracking-widest">SOUTH SECTOR</text>

            {/* URBAN CENTERS (Bright glowing dots) */}
            
            {/* Edmonton: ~53.5N (Upper Central) */}
            <g onMouseEnter={() => setHoveredZone('Edmonton')} onMouseLeave={() => setHoveredZone(null)} className="cursor-crosshair">
              <circle cx="230" cy="360" r="15" fill={getFillColor('Edmonton')} className="opacity-20 animate-ping pointer-events-none" />
              <circle cx="230" cy="360" r="4" fill="#fff" filter="url(#glow)" />
              <circle cx="230" cy="360" r="8" stroke="#fff" strokeWidth="1" fill="transparent" className="opacity-50" />
              <text x="245" y="364" className="text-[10px] font-bold font-mono fill-white opacity-80">EDMONTON</text>
            </g>

            {/* Calgary: ~51.0N (Lower Central/Upper South) */}
            <g onMouseEnter={() => setHoveredZone('Calgary')} onMouseLeave={() => setHoveredZone(null)} className="cursor-crosshair">
              <circle cx="220" cy="480" r="15" fill={getFillColor('Calgary')} className="opacity-20 animate-ping pointer-events-none" />
              <circle cx="220" cy="480" r="4" fill="#fff" filter="url(#glow)" />
              <circle cx="220" cy="480" r="8" stroke="#fff" strokeWidth="1" fill="transparent" className="opacity-50" />
              <text x="235" y="484" className="text-[10px] font-bold font-mono fill-white opacity-80">CALGARY</text>
            </g>
          </g>

          {/* Decorative Tech UI Elements */}
          <line x1="20" y1="50" x2="20" y2="600" stroke="#334155" strokeWidth="1" />
          <line x1="15" y1="50" x2="25" y2="50" stroke="#64748b" strokeWidth="1" />
          <line x1="15" y1="600" x2="25" y2="600" stroke="#64748b" strokeWidth="1" />
          <text x="10" y="325" transform="rotate(-90 10,325)" className="text-[8px] font-mono fill-slate-500 tracking-widest">LATITUDE 110W / 120W</text>
          
          <Crosshair className="text-slate-600/50 absolute top-1/2 left-1/2 w-96 h-96" />
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded text-xs font-mono">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-emerald-400">OPTIMAL</span>
            </div>
             <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              <span className="text-amber-400">WARNING</span>
            </div>
             <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse"></div>
              <span className="text-rose-400">CRITICAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
