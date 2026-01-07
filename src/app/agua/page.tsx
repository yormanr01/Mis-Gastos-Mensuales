
'use client';


import { useState, useMemo, useCallback } from 'react';
import { ServiceHistory } from "@/components/history/service-history";
import { AguaTable } from "@/components/history/agua-table";
import { AguaForm } from "@/components/forms/agua-form";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Droplet, Download } from "lucide-react";

export default function AguaPage() {
  const { waterData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return waterData;
    const lowerSearch = searchTerm.toLowerCase();
    return waterData.filter(record => {
      const monthMatch = record.month.toLowerCase().includes(lowerSearch);
      const yearMatch = record.year.toString().includes(lowerSearch);
      return monthMatch || yearMatch;
    });
  }, [waterData, searchTerm]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Año', 'Mes', 'Total Facturado', 'Descuento', 'Total a Pagar', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(r =>
        [r.year, r.month, r.totalInvoiced, r.discount, r.totalToPay, r.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_agua.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredData]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Servicio de Agua" icon={Droplet}>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={filteredData.length === 0}
          className="h-11 px-6 shadow-sm hover:shadow-md transition-all"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <ServiceHistory
          serviceName="Agua"
          FormComponent={AguaForm}
          TableComponent={AguaTable}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </main>
    </div>
  );
}
