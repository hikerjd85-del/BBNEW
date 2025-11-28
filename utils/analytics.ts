import { HRRecord, FilterState } from '../types';

export const filterData = (data: HRRecord[], filters: FilterState): HRRecord[] => {
  return data.filter(record => {
    if (filters.fy && record.fy !== filters.fy) return false;
    if (filters.geoZone && record.geoZone !== filters.geoZone) return false;
    if (filters.unionGroup && record.unionGroup !== filters.unionGroup) return false;
    if (filters.urbanRural && record.urbanRural !== filters.urbanRural) return false;
    return true;
  });
};

export const aggregateByMonth = (data: HRRecord[]) => {
  const groups: Record<number, { 
    monthIndex: number;
    month: string;
    fy: string;
    totalOvertime: number;
    totalSick: number;
    count: number;
  }> = {};

  data.forEach(d => {
    if (!groups[d.monthIndex]) {
      groups[d.monthIndex] = {
        monthIndex: d.monthIndex,
        month: d.month,
        fy: d.fy,
        totalOvertime: 0,
        totalSick: 0,
        count: 0
      };
    }
    groups[d.monthIndex].totalOvertime += d.overtimeHours;
    groups[d.monthIndex].totalSick += d.sickHours;
    groups[d.monthIndex].count += 1;
  });

  return Object.values(groups).sort((a, b) => a.monthIndex - b.monthIndex);
};

// Simulate a Predictive Model (Linear Regression with Lag)
export const generatePredictions = (aggregatedData: any[]) => {
  // We want to predict Sick Hours (t) based on Overtime (t-1)
  // Simple logic: PredictedSick(t) = Alpha + Beta * Overtime(t-1)
  
  // 1. Calculate coefficients (mock training)
  const beta = 0.25; // 1 hour of OT leads to 0.25 hours of Sick leave (Hypothesis)
  const alpha = 50; // Base sick load per month for the aggregate group

  return aggregatedData.map((curr, index) => {
    // Look at previous month for the predictor
    const prev = aggregatedData[index - 1];
    let predictedSick = 0;
    
    if (prev) {
      predictedSick = alpha + (prev.totalOvertime * beta / prev.count) * curr.count; 
      // Normalize by count to keep scale correct if group size changes (it shouldn't in synthetic, but good practice)
      // Actually, let's just use raw totals for the visual impact
      predictedSick = (prev.totalOvertime * 0.4) + (curr.count * 10); // Simple model
    } else {
      predictedSick = curr.totalSick; // No prediction for first month
    }

    return {
      ...curr,
      predictedSick: Math.round(predictedSick),
      // Flag if prediction matches actual closely or if there's a deviation
      riskLevel: predictedSick > curr.totalSick * 1.2 ? 'High' : 'Normal'
    };
  });
};

export const calculateKPIMetrics = (data: HRRecord[]) => {
  const totalWorked = data.reduce((acc, curr) => acc + curr.workedHours, 0);
  const totalOvertime = data.reduce((acc, curr) => acc + curr.overtimeHours, 0);
  const totalSick = data.reduce((acc, curr) => acc + curr.sickHours, 0);
  
  // Cost Avoidance: Assume if we reduce OT by 10%, we save related Sick costs.
  // Rate: $50/hr. 
  // Metric: Estimated cost of Sick hours that were "caused" by excess overtime.
  // Assumption: 30% of Sick time is burnout related.
  const costAvoidance = totalSick * 0.3 * 50; 

  // Next Month Projection (Fake it by taking last month Avg * 1.1)
  const projection = (totalSick / (data.length || 1)) * 50 * 1.1; // roughly scaled

  return {
    totalOvertime,
    totalSick,
    overtimeRate: (totalOvertime / totalWorked) * 100,
    costAvoidance,
    projectedSick: projection
  };
};

export const identifyCriticalDepts = (data: HRRecord[]) => {
  // Find latest month in dataset for "Current Status"
  if (data.length === 0) return [];
  const maxIndex = Math.max(...data.map(d => d.monthIndex));
  
  const currentMonthData = data.filter(d => d.monthIndex === maxIndex);
  
  // Calculate 80th percentile for Sick Hours
  const sickValues = currentMonthData.map(d => d.sickHours).sort((a, b) => a - b);
  const p80Index = Math.floor(sickValues.length * 0.8);
  const p80Value = sickValues[p80Index];

  return currentMonthData
    .filter(d => d.sickHours > p80Value)
    .map(d => {
      // Logic for recommendation
      let recommendation = "Monitor";
      if (d.overtimeHours > 40) recommendation = "Mandatory Rest / Audit Schedule";
      else if (d.vacancyRate > 0.15) recommendation = "Expedite Hiring / Float Pool";
      else recommendation = "Wellness Check-in";

      return {
        ...d,
        recommendation
      };
    })
    .sort((a, b) => b.sickHours - a.sickHours); // Sort by highest risk
};
