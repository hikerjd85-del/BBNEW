import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color: 'teal' | 'rose' | 'indigo' | 'slate';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendDirection, color, icon }) => {
  const colorMap = {
    teal: 'bg-teal-50 border-teal-100 text-teal-900',
    rose: 'bg-rose-50 border-rose-100 text-rose-900',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-900',
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
  };

  const trendColor = trendDirection === 'up' ? 'text-rose-600' : trendDirection === 'down' ? 'text-teal-600' : 'text-slate-500';

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${colorMap[color]} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium opacity-70 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        {icon && <div className="p-2 bg-white bg-opacity-60 rounded-lg">{icon}</div>}
      </div>
      {trend && (
        <div className="flex items-center text-sm">
          <span className={`font-semibold mr-2 ${trendColor}`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
          <span className="opacity-60">vs last month</span>
        </div>
      )}
    </div>
  );
};
