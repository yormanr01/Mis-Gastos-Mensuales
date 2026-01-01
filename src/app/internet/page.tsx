
'use client';


import { ServiceHistory } from "@/components/history/service-history";
import { InternetTable } from "@/components/history/internet-table";
import { InternetForm } from "@/components/forms/internet-form";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { Wifi } from "lucide-react";

export default function InternetPage() {
  const { internetData, isLoading } = useApp();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Servicio de Internet" icon={Wifi} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <ServiceHistory
          serviceName="Internet"
          FormComponent={InternetForm}
          TableComponent={InternetTable}
        />
      </main>
    </div>
  );
}
