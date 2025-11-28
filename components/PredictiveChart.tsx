import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';

interface PredictiveChartProps {
  data: any[];
}

export const PredictiveChart: React.FC<PredictiveChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Predictive Model: Overtime vs. Sick Leave</h2>
        <p className="text-sm text-slate-500">
          Showing historical correlation where <span className="font-semibold text-amber-600">Overtime spikes</span> typically precede <span className="font-semibold text-rose-600">Sick Leave surges</span>.
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              tick={{fill: '#64748b', fontSize: 12}} 
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            {/* Left Axis: Overtime (Predictor) */}
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#d97706"
              label={{ value: 'Overtime Hours', angle: -90, position: 'insideLeft', fill: '#d97706' }}
            />
            {/* Right Axis: Sick Hours (Target) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#e11d48"
              label={{ value: 'Sick Hours', angle: 90, position: 'insideRight', fill: '#e11d48' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="totalOvertime"
              name="Overtime (Predictor)"
              fill="url(#colorOt)"
              stroke="#d97706"
              strokeWidth={2}
              fillOpacity={0.1}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalSick"
              name="Actual Sick Hours"
              stroke="#e11d48"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="predictedSick"
              name="Predicted Sick Hours (Model)"
              stroke="#4f46e5"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />

            <defs>
              <linearGradient id="colorOt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
