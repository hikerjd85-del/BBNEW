import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { RiskHeatmap } from './components/RiskHeatmap';
import { GeoMap } from './components/GeoMap';
import { PredictiveChart } from './components/PredictiveChart';
import { ActionTable } from './components/ActionTable';
import { generateSyntheticData } from './utils/dataGenerator';
import { filterData, aggregateByMonth, generatePredictions, calculateKPIMetrics, identifyCriticalDepts } from './utils/analytics';
import { HRRecord, FilterState } from './types';
import { AlertOctagon, TrendingUp, DollarSign, Clock } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [rawData, setRawData] = useState<HRRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    fy: '2025', // Default to 2025 for better visualization of historical context
    geoZone: '',
    unionGroup: '',
    urbanRural: ''
  });
  const [isPredicting, setIsPredicting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load Data on Mount
  useEffect(() => {
    // Simulate API fetch
    const data = generateSyntheticData();
    setRawData(data);
  }, []);

  // Filter Data
  const filteredData = useMemo(() => filterData(rawData, filters), [rawData, filters]);

  // Analytics Calculation
  const metrics = useMemo(() => calculateKPIMetrics(filteredData), [filteredData]);
  
  // Chart Data Preparation
  const chartData = useMemo(() => {
    const aggregated = aggregateByMonth(filteredData);
    // Add predictive layer
    return generatePredictions(aggregated);
  }, [filteredData]);

  // Critical Departments
  const criticalDepts = useMemo(() => identifyCriticalDepts(filteredData), [filteredData]);

  const handleRunPrediction = () => {
    setIsPredicting(true);
    // Simulate processing time for UX
    setTimeout(() => {
      setIsPredicting(false);
      setLastUpdated(new Date());
    }, 800);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar 
        filters={filters} 
        setFilters={setFilters} 
        onRunPrediction={handleRunPrediction}
        isPredicting={isPredicting}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 sm:ml-64 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workforce Burnout Analytics</h1>
            <p className="text-slate-500 mt-1">
              Data snapshot: {filters.fy ? `Fiscal Year ${filters.fy}` : 'All Years'} • 
              Predictions updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="hidden md:block">
             <div className="flex space-x-2 text-sm text-slate-400">
               <span>Algorithm: Linear Regression (Lag-1)</span>
               <span>•</span>
               <span>Data Source: SyntheticDB</span>
             </div>
          </div>
        </div>

        {/* Section A: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Overtime Hours"
            value={metrics.totalOvertime.toLocaleString()}
            trend="12.5%"
            trendDirection="up"
            color="indigo"
            icon={<Clock className="w-6 h-6 text-indigo-600" />}
          />
           <MetricCard
            title="Avg Sick Leave Rate"
            value={`${(metrics.totalSick / (metrics.totalOvertime * 4) * 100).toFixed(1)}%`} // Approximation
            trend="0.8%"
            trendDirection="down" // Good news
            color="teal"
            icon={<TrendingUp className="w-6 h-6 text-teal-600" />}
          />
          <MetricCard
            title="Projected Sick Hours"
            value={Math.round(metrics.projectedSick).toLocaleString()}
            trend="5.2%"
            trendDirection="up"
            color="rose"
            icon={<AlertOctagon className="w-6 h-6 text-rose-600" />}
          />
          <MetricCard
            title="Est. Cost Avoidance"
            value={`$${Math.round(metrics.costAvoidance).toLocaleString()}`}
            color="slate"
            icon={<DollarSign className="w-6 h-6 text-slate-600" />}
          />
        </div>

        {/* Section A2: Geographic & Risk Analysis (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <GeoMap data={filteredData} />
          </div>
          <div className="lg:col-span-2">
            <RiskHeatmap data={filteredData} />
          </div>
        </div>

        {/* Section B: Predictive Chart */}
        <div className="mb-8">
          <PredictiveChart data={chartData} />
        </div>

        {/* Section C: Action Table */}
        <div className="mb-8">
          <ActionTable data={criticalDepts} />
        </div>

      </main>
    </div>
  );
};

export default App;
