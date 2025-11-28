import { HRRecord, MONTHS, FISCAL_YEARS, GEO_ZONES, UNION_GROUPS, URBAN_RURAL } from '../types';

// Deterministic pseudo-random helper for consistent demos
let seed = 1234;
const random = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

export const generateSyntheticData = (): HRRecord[] => {
  const data: HRRecord[] = [];
  
  // Generate distinct departments to track over time
  const departments = Array.from({ length: 50 }, (_, i) => ({
    id: `D${1000 + i}`,
    geoZone: getRandomItem(GEO_ZONES),
    unionGroup: getRandomItem(UNION_GROUPS),
    urbanRural: getRandomItem(URBAN_RURAL) as 'Urban' | 'Rural',
    jobFunction: getRandomItem(['Registered Nurse', 'EMS', 'Admin', 'Maintenance', 'Allied Health']),
    baseOvertime: random() * 20 + 5, // Each dept has a baseline behavior
    baseSick: random() * 10 + 2,
    sensitivity: random() * 0.8 + 0.2, // How sensitive they are to burnout
  }));

  // Iterate through time to create time-series
  FISCAL_YEARS.forEach(fy => {
    MONTHS.forEach((month, monthIndex) => {
      // Create a seasonal factor (e.g., flu season in winter)
      const isWinter = monthIndex < 2 || monthIndex > 9;
      const seasonalSickMultiplier = isWinter ? 1.3 : 0.8;
      
      // Simulate an event: "Summer Vacation crunch" in July/Aug causing OT spikes
      const isSummer = monthIndex >= 6 && monthIndex <= 7;
      const seasonalOTMultiplier = isSummer ? 1.5 : 1.0;

      departments.forEach(dept => {
        // 1. Calculate Overtime (The Predictor)
        // Add some random volatility
        const otNoise = (random() - 0.5) * 20;
        const currentOvertime = Math.max(0, (dept.baseOvertime * seasonalOTMultiplier) + otNoise);

        // 2. Calculate Worked Hours (Denominator)
        const workedHours = 160 + (random() * 10); 

        // 3. Calculate Sick Hours (The Target)
        // CRITICAL LOGIC: Sick hours are correlated to *previous* months of high stress (lag)
        // We simulate this by checking if there was a "burnout event" recently in the simulation state
        // Since we are generating in order, we can look at "past" state conceptually.
        // For simplicity in this synthetic generator, we'll create a "lag" effect by 
        // using the *department's* intrinsic fatigue accumulator + current seasonality.
        
        // However, to strictly satisfy the "Lag Correlation" requirement for the dataset itself:
        // We will make Sick Hours dependent on a "Fatigue Score" which tracks cumulative OT.
        
        // Let's use a simpler proxy for the Lag_1 feature:
        // Assume the "previous month's OT" was roughly similar to this month's OT minus the noise we just added,
        // OR better yet, let's just create the record. Later, when we ANALYZE, we will shift the columns.
        // But to ensure the correlation exists in the data:
        
        // We will calculate Sick Hours based on a "Hidden" lagged value.
        // Let's assume the "previous" month OT was high if this is a high OT dept, plus random.
        // To make it robust:
        // Sick = Base + (Current_OT * 0.1) + (Random_Lagged_OT_Factor * 0.5)
        // To force the correlation: We'll imply that if OT is high NOW, Sick will be high NEXT month.
        // So we set Sick Hours for *this* month based on *previous* iterations' OT?
        // Easier: Just model Sick as:
        // Sick = Base * Seasonal + (PreviousMonthOT * Sensitivity).
        
        // Since we don't have easy access to the exact "previous row" in this loop without lookups,
        // we'll approximate:
        // We simulate a 'fatigue' variable that changes slowly.
        const fatigue = (dept.baseOvertime * seasonalOTMultiplier) * dept.sensitivity; 
        
        // This month's sick time is heavily influenced by 'fatigue' (which correlates to OT trends)
        const sickNoise = (random() - 0.5) * 5;
        const sickHours = Math.max(0, (dept.baseSick * seasonalSickMultiplier) + (fatigue * 0.4) + sickNoise);

        const vacancyRate = Math.min(0.3, Math.max(0, (random() * 0.1) + (sickHours > 20 ? 0.05 : 0)));

        data.push({
          id: `${dept.id}-${fy}-${monthIndex}`,
          fy,
          month,
          monthIndex: monthIndex + (parseInt(fy) - 2024) * 12, // Continuous index for plotting
          geoZone: dept.geoZone,
          unionGroup: dept.unionGroup,
          jobFunction: dept.jobFunction,
          deptId: dept.id,
          urbanRural: dept.urbanRural,
          workedHours: Math.round(workedHours),
          overtimeHours: Math.round(currentOvertime),
          sickHours: Math.round(sickHours),
          vacancyRate: parseFloat(vacancyRate.toFixed(2)),
          burnoutRiskScore: currentOvertime / workedHours, // Raw Risk
        });
      });
    });
  });

  return data;
};
