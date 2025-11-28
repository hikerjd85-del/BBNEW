import React from 'react';
import { HRRecord, GEO_ZONES } from '../types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiskHeatmapProps {
  data: HRRecord[];
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ data }) => {
  // Aggregate data by Geo Zone
  const zoneStats = GEO_ZONES.map(zone => {
    const zoneRecords = data.filter(d => d.geoZone === zone);
    const totalOT = zoneRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
    const totalWorked = zoneRecords.reduce((sum, r) => sum + r.workedHours, 0) || 1;
    const riskRatio = totalOT / totalWorked;
    
    return {
      zone,
      riskRatio,
      recordCount: zoneRecords.length
    };
  }).sort((a, b) => b.riskRatio - a.riskRatio); // Sort high risk first

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Burnout Risk Heatmap</h2>
          <p className="text-sm text-slate-500">Ratio of Overtime to Regular Hours by Geo Zone</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {zoneStats.map((stat) => {
          // Determine color intensity based on risk
          // Assume "High Risk" is > 10% OT (0.10)
          const isHighRisk = stat.riskRatio > 0.12;
          const isMediumRisk = stat.riskRatio > 0.08;
          
          let colorClass = 'bg-emerald-50 border-emerald-200';
          let textColor = 'text-emerald-800';
          let progressColor = 'bg-emerald-500';
          
          if (isHighRisk) {
            colorClass = 'bg-rose-50 border-rose-200';
            textColor = 'text-rose-800';
            progressColor = 'bg-rose-500';
          } else if (isMediumRisk) {
            colorClass = 'bg-amber-50 border-amber-200';
            textColor = 'text-amber-800';
            progressColor = 'bg-amber-500';
          }

          return (
            <div key={stat.zone} className={`p-4 rounded-lg border ${colorClass} flex flex-col justify-between`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold ${textColor}`}>{stat.zone}</span>
                {isHighRisk ? 
                  <AlertTriangle className="w-5 h-5 text-rose-500" /> : 
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                }
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1 opacity-80">
                  <span>Burnout Index</span>
                  <span>{(stat.riskRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${progressColor}`} 
                    style={{ width: `${Math.min(stat.riskRatio * 500, 100)}%` }} // Scale for visibility
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
