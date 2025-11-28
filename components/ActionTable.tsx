import React from 'react';
import { HRRecord } from '../types';
import { AlertCircle } from 'lucide-react';

interface ActionTableProps {
  data: (HRRecord & { recommendation: string })[];
}

export const ActionTable: React.FC<ActionTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <AlertCircle className="w-5 h-5 text-rose-500 mr-2" />
            Departments at Critical Risk (Predicted Sick > 80th Percentile)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Prescriptive actions based on vacancy rates and overtime intensity.
          </p>
        </div>
        <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full">
          {data.length} Critical Units
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Dept ID</th>
              <th className="px-6 py-3 font-semibold">Geo Zone</th>
              <th className="px-6 py-3 font-semibold text-right">Overtime Hrs</th>
              <th className="px-6 py-3 font-semibold text-right">Vacancy Rate</th>
              <th className="px-6 py-3 font-semibold text-right">Projected Sick Hrs</th>
              <th className="px-6 py-3 font-semibold">Recommended Intervention</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((dept) => (
                <tr key={dept.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{dept.deptId}</td>
                  <td className="px-6 py-4">{dept.geoZone}</td>
                  <td className="px-6 py-4 text-right font-mono text-amber-600">{dept.overtimeHours}</td>
                  <td className="px-6 py-4 text-right font-mono">{(dept.vacancyRate * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right font-mono text-rose-600 font-bold">{dept.sickHours}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${dept.recommendation.includes('Hire') ? 'bg-indigo-50 text-indigo-800 border-indigo-100' : 
                        dept.recommendation.includes('Audit') ? 'bg-rose-50 text-rose-800 border-rose-100' : 
                        'bg-slate-100 text-slate-800 border-slate-200'}`}>
                      {dept.recommendation}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No departments match critical risk criteria. Good work!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
