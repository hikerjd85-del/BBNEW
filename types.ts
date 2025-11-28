export interface HRRecord {
  id: string;
  fy: string;
  month: string;
  monthIndex: number; // 0-11 for sorting
  geoZone: string;
  unionGroup: string;
  jobFunction: string;
  deptId: string;
  urbanRural: 'Urban' | 'Rural';
  workedHours: number;
  overtimeHours: number;
  sickHours: number;
  vacancyRate: number;
  // Derived/Predicted fields
  predictedSickHours?: number;
  burnoutRiskScore?: number;
}

export interface FilterState {
  fy: string;
  geoZone: string;
  unionGroup: string;
  urbanRural: string;
}

export const FISCAL_YEARS = ['2024', '2025', '2026'];
export const GEO_ZONES = ['North', 'South', 'Central', 'Edmonton', 'Calgary'];
export const UNION_GROUPS = ['UNA', 'HSAA', 'AUPE-GSS', 'Non-Union'];
export const URBAN_RURAL = ['Urban', 'Rural'];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];
