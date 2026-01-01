
'use client';


import { ServiceHistory } from "@/components/history/service-history";
import { ElectricidadTable } from "@/components/history/electricidad-table";
import { ElectricidadForm } from "@/components/forms/electricidad-form";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { Lightbulb } from "lucide-react";

export default function ElectricidadPage() {
  const { electricityData, isLoading } = useApp();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Servicio Eléctrico" icon={Lightbulb} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <ServiceHistory
          serviceName="Electricidad"
          FormComponent={ElectricidadForm}
          TableComponent={ElectricidadTable}
        />
      </main>
    </div>
  );
}
