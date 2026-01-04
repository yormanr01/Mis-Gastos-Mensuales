'use client';

import { useMemo } from 'react';
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnnualChart } from "@/components/dashboard/annual-chart";
import { InsightsModal } from "@/components/dashboard/insights-modal";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { LayoutDashboard } from "lucide-react";

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
      <PageHeader title="Panel Principal" icon={LayoutDashboard} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <div className="flex flex-col gap-6">
          {/* Fila 1: Total y Gráfico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-1">
              <StatsCards filter="main" />
            </div>
            <div className="lg:col-span-2">
              <AnnualChart
                year={selectedYear}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                availableYears={availableYears}
              />
            </div>
          </div>

          {/* Fila 2: Servicios */}
          <div>
            <StatsCards filter="services" />
          </div>
        </div>
      </main>
      <InsightsModal />
    </div>
  );
}
