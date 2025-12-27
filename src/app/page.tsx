'use client';

import { useMemo } from 'react';
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnnualChart } from "@/components/dashboard/annual-chart";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { useApp } from "@/lib/hooks/use-app";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { waterData, electricityData, internetData, selectedYear, setSelectedYear } = useApp();
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);

    waterData.forEach(d => years.add(d.year));
    electricityData.forEach(d => years.add(d.year));
    internetData.forEach(d => years.add(d.year));

    return Array.from(years).sort((a, b) => b - a);
  }, [waterData, electricityData, internetData, currentYear]);

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="space-y-6">
          <StatsCards />
          <AnnualChart
            year={selectedYear}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
          />
          <InsightsCard />
        </div>
      </main>
    </div>
  );
}
