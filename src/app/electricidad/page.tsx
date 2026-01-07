
'use client';


import { useState, useMemo, useCallback } from 'react';
import { ServiceHistory } from "@/components/history/service-history";
import { ElectricidadTable } from "@/components/history/electricidad-table";
import { ElectricidadForm } from "@/components/forms/electricidad-form";
import { useApp } from "@/lib/hooks/use-app";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Lightbulb, Download } from "lucide-react";

export default function ElectricidadPage() {
  const { electricityData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return electricityData;
    const lowerSearch = searchTerm.toLowerCase();
    return electricityData.filter(record => {
      const monthMatch = record.month.toLowerCase().includes(lowerSearch);
      const yearMatch = record.year.toString().includes(lowerSearch);
      return monthMatch || yearMatch;
    });
  }, [electricityData, searchTerm]);

  const handleExportCSV = useCallback(() => {
    const headers = [
      'Año', 'Mes', 'Total Facturado', 'Consumo kWh', 'Costo kWh',
      'Contador Anterior', 'Contador Actual', 'Consumo Contador',
      'Descuento', 'Total a Pagar', 'Estado'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(r =>
        [
          r.year, r.month, r.totalInvoiced, r.kwhConsumption, r.kwhCost,
          r.previousMeter, r.currentMeter, r.consumptionMeter,
          r.discount, r.totalToPay, r.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_electricidad.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredData]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Servicio Eléctrico" icon={Lightbulb}>
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
          serviceName="Electricidad"
          FormComponent={ElectricidadForm}
          TableComponent={ElectricidadTable}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </main>
    </div>
  );
}
