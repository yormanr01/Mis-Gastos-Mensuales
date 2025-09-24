
'use client';

import { PageHeader } from "@/components/page-header";
import { ServiceHistory } from "@/components/history/service-history";
import { ElectricidadTable } from "@/components/history/electricidad-table";
import { ElectricidadForm } from "@/components/forms/electricidad-form";
import { useApp } from "@/lib/hooks/use-app";

export default function ElectricidadPage() {
  const { electricityData, isLoading } = useApp();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Consumo de Electricidad" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <ServiceHistory
          data={electricityData}
          isLoading={isLoading}
          serviceName="Electricidad"
          FormComponent={ElectricidadForm}
          TableComponent={ElectricidadTable}
        />
      </main>
    </div>
  );
}
