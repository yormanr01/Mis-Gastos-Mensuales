
'use client';


import { ServiceHistory } from "@/components/history/service-history";
import { AguaTable } from "@/components/history/agua-table";
import { AguaForm } from "@/components/forms/agua-form";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { Droplet } from "lucide-react";

export default function AguaPage() {
  const { waterData, isLoading } = useApp();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Servicio de Agua" icon={Droplet} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <ServiceHistory
          serviceName="Agua"
          FormComponent={AguaForm}
          TableComponent={AguaTable}
        />
      </main>
    </div>
  );
}
