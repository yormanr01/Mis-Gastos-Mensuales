
'use client';


import { ServiceHistory } from "@/components/history/service-history";
import { InternetTable } from "@/components/history/internet-table";
import { InternetForm } from "@/components/forms/internet-form";
import { useApp } from "@/lib/hooks/use-app";

export default function InternetPage() {
  const { internetData, isLoading } = useApp();

  return (
    <div className="flex flex-col h-full">

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <ServiceHistory
          data={internetData}
          isLoading={isLoading}
          serviceName="Internet"
          FormComponent={InternetForm}
          TableComponent={InternetTable}
        />
      </main>
    </div>
  );
}
