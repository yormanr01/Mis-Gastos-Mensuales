
'use client';

import { PageHeader } from "@/components/page-header";
import { ServiceHistory } from "@/components/history/service-history";
import { AguaTable } from "@/components/history/agua-table";
import { AguaForm } from "@/components/forms/agua-form";
import { useApp } from "@/lib/hooks/use-app";

export default function AguaPage() {
  const { waterData, isLoading } = useApp();
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Consumo de Agua" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <ServiceHistory
          data={waterData}
          isLoading={isLoading}
          serviceName="Agua"
          FormComponent={AguaForm}
          TableComponent={AguaTable}
        />
      </main>
    </div>
  );
}
