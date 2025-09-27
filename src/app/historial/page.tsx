
'use client';

import { PageHeader } from "@/components/page-header";
import { useApp } from "@/lib/hooks/use-app";
import { months, WaterRecord, ElectricityRecord, InternetRecord } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

type CombinedData = {
  water: WaterRecord | null;
  electricity: ElectricityRecord | null;
  internet: InternetRecord | null;
  total: number;
};

export default function HistorialPage() {
  const { waterData, electricityData, internetData } = useApp();

  const combinedData: { [key: string]: CombinedData } = {};

  const processData = () => {
    const allRecords = [
      ...waterData.map(d => ({ ...d, type: 'water' })),
      ...electricityData.map(d => ({ ...d, type: 'electricity' })),
      ...internetData.map(d => ({ ...d, type: 'internet' }))
    ];

    allRecords.forEach(record => {
      const key = `${record.month}-${record.year}`;
      if (!combinedData[key]) {
        combinedData[key] = { water: null, electricity: null, internet: null, total: 0 };
      }
      
      const value = 'monthlyCost' in record ? record.monthlyCost : record.totalToPay;

      if (record.type === 'water') combinedData[key].water = record as WaterRecord;
      if (record.type === 'electricity') combinedData[key].electricity = record as ElectricityRecord;
      if (record.type === 'internet') combinedData[key].internet = record as InternetRecord;
      
      combinedData[key].total += value;
    });
  };

  processData();

  const sortedMonths = Object.keys(combinedData);

  const handlePrint = (monthKey: string) => {
    const [month, year] = monthKey.split('-');
    const data = combinedData[monthKey];
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Resumen de Gastos - ${month} ${year}</title>
            <style>
              body { 
                font-family: sans-serif; 
                margin: 1rem; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
              }
              .container { max-width: 800px; margin: auto; }
              h1 { font-size: 1.5rem; color: #1e40af; }
              h2 { font-size: 1.1rem; color: #1e40af; border-bottom: 1px solid #eef2ff; padding-bottom: 4px; margin-top: 1.25rem; margin-bottom: 0.75rem; }
              table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.9rem; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
              th { background-color: #f2f2f2; width: 50%; }
              tfoot { font-weight: bold; }
              .total-row { background-color: #eef2ff; font-size: 1rem;}
              .formulas { margin-top: 1rem; padding: 0.75rem; border: 1px dashed #ddd; background-color: #fafafa; font-size: 0.8rem; }
              .formulas h3 { margin-top: 0; color: #374151; font-size: 0.9rem;}
              .formulas p { margin: 0.25rem 0; font-family: monospace; color: #111827; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Resumen de Gastos - ${month} ${year}</h1>
              
              ${data.water ? `
              <h2><span role="img" aria-label="water-drop">💧</span> Consumo de Agua</h2>
              <table>
                <tbody>
                  <tr><th>Total Facturado</th><td>${formatCurrency(data.water.totalInvoiced)}</td></tr>
                  <tr><th>Descuento</th><td>${formatCurrency(data.water.discount)}</td></tr>
                  <tr class="total-row"><th>Total a Pagar</th><td>${formatCurrency(data.water.totalToPay)}</td></tr>
                </tbody>
              </table>` : ''}

              ${data.electricity ? `
              <h2><span role="img" aria-label="light-bulb">💡</span> Consumo de Electricidad</h2>
              <table>
                <tbody>
                  <tr><th>Total Facturado</th><td>${formatCurrency(data.electricity.totalInvoiced)}</td></tr>
                  <tr><th>Consumo (kWh)</th><td>${data.electricity.kwhConsumption.toFixed(2)}</td></tr>
                  <tr><th>Costo por kWh</th><td>${formatCurrency(data.electricity.kwhCost)}</td></tr>
                  <tr><th>Contador Anterior</th><td>${data.electricity.previousMeter}</td></tr>
                  <tr><th>Contador Actual</th><td>${data.electricity.currentMeter}</td></tr>
                  <tr><th>Consumo del Contador</th><td>${data.electricity.consumptionMeter.toFixed(0)}</td></tr>
                  <tr class="total-row"><th>Total a Pagar</th><td>${formatCurrency(data.electricity.totalToPay)}</td></tr>
                </tbody>
              </table>
              <div class="formulas">
                <h3>Fórmulas de Cálculo</h3>
                <p><b>Consumo del Contador</b> = Contador Actual - Contador Anterior</p>
                <p><b>Costo por kWh</b> = Total Facturado / Consumo (kWh)</p>
                <p><b>Total a Pagar</b> = Consumo del Contador * Costo por kWh</p>
              </div>
              ` : ''}
              
              ${data.internet ? `
              <h2><span role="img" aria-label="wifi">🌐</span> Costo de Internet</h2>
              <table>
                <tbody>
                  <tr class="total-row"><th>Costo Mensual</th><td>${formatCurrency(data.internet.monthlyCost)}</td></tr>
                </tbody>
              </table>` : ''}

              <h2>Resumen General</h2>
              <table>
                <tfoot>
                  <tr class="total-row">
                    <td>Total General del Mes</td>
                    <td>${formatCurrency(data.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const handleExportCSV = () => {
    const headers = ['Año', 'Mes', 'Agua', 'Electricidad', 'Internet', 'Total del Mes'];
    const csvContent = [
      headers.join(','),
      ...sortedMonths.map(monthKey => {
        const [month, year] = monthKey.split('-');
        const data = combinedData[monthKey];
        const row = [
          year,
          month,
          data.water?.totalToPay ?? 0,
          data.electricity?.totalToPay ?? 0,
          data.internet?.monthlyCost ?? 0,
          data.total
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_consolidado.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Historial Mensual" />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Card>
           <CardHeader>
              <CardTitle>Resumen de Gastos por Mes</CardTitle>
            </CardHeader>
          <CardContent>
            {sortedMonths.length > 0 ? (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedMonths.map(monthKey => {
                      const [month, year] = monthKey.split('-');
                      const data = combinedData[monthKey];
                      return (
                          <div key={monthKey} className="rounded-lg border p-4">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <div className="font-bold text-lg">{month} {year}</div>
                                      <div className="text-sm font-bold text-primary">{formatCurrency(data.total)}</div>
                                  </div>
                                  <Button variant="outline" size="icon" onClick={() => handlePrint(monthKey)}>
                                    <Printer className="h-4 w-4" />
                                  </Button>
                              </div>
                              <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Agua:</span>
                                      <span>{formatCurrency(data.water?.totalToPay)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Electricidad:</span>
                                      <span>{formatCurrency(data.electricity?.totalToPay)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">Internet:</span>
                                      <span>{formatCurrency(data.internet?.monthlyCost)}</span>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead className="text-right">Agua</TableHead>
                        <TableHead className="text-right">Electricidad</TableHead>
                        <TableHead className="text-right">Internet</TableHead>
                        <TableHead className="text-right font-bold">Total del Mes</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMonths.map(monthKey => {
                        const [month, year] = monthKey.split('-');
                        const data = combinedData[monthKey];
                        return (
                          <TableRow key={monthKey}>
                            <TableCell>
                              <div className="font-medium">{month}</div>
                              <div className="text-sm text-muted-foreground">{year}</div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(data.water?.totalToPay)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.electricity?.totalToPay)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(data.internet?.monthlyCost)}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{formatCurrency(data.total)}</TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="icon" onClick={() => handlePrint(monthKey)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                  <h3 className="text-lg font-semibold">No hay datos disponibles</h3>
                  <p className="text-muted-foreground">
                    Añade registros en las secciones de Agua, Electricidad e Internet para ver el historial.
                  </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handleExportCSV} disabled={sortedMonths.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar a CSV
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
