import { StatsCards } from "@/components/dashboard/stats-cards";
import { AnnualChart } from "@/components/dashboard/annual-chart";
import { PageHeader } from "@/components/page-header";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="space-y-6">
          <StatsCards />
          <AnnualChart />
        </div>
      </main>
    </div>
  );
}
