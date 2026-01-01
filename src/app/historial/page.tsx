
'use client';


import { useState, useMemo, useCallback } from 'react';
import { useApp } from "@/lib/hooks/use-app";
import { useIsMobile } from "@/hooks/use-mobile";
import { months, WaterRecord, ElectricityRecord, InternetRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Printer, Download, Droplet, Lightbulb, Wifi, History } from "lucide-react";
import { PageHeader } from "@/components/page-header";

type CombinedData = {
  water: WaterRecord | null;
  electricity: ElectricityRecord | null;
  internet: InternetRecord | null;
  total: number;
};

type CombinedDataMap = { [key: string]: CombinedData };

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function HistorialPage() {
  const { waterData, electricityData, internetData, selectedYear } = useApp();
  const isMobile = useIsMobile();
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ monthKey: string; data: CombinedData } | null>(null);

  const handlePrintDesktop = (monthKey: string, data: CombinedData) => {
    const [month, year] = monthKey.split('-');

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const printDocument = iframe.contentWindow?.document;
    if (printDocument) {
      printDocument.write(`
          <html>
            <head>
              <title>Resumen de Gastos - ${month} ${year}</title>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
              <style>
                body { 
                  font-family: 'Inter', sans-serif; 
                  margin: 1rem; 
                  color: #1e293b;
                  background-color: #f8fafc;
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                }
                .container { max-width: 800px; margin: auto; }
                header { 
                  margin-bottom: 1rem; 
                  padding-bottom: 1rem; 
                  border-bottom: 2px solid #e2e8f0;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                }
                h1 { margin: 0; font-size: 1.5rem; color: #4338ca; font-weight: 700; }
                .date { font-size: 1rem; color: #64748b; font-weight: 500; }
                
                .card {
                  background: white;
                  border-radius: 0.75rem;
                  border: 1px solid #e2e8f0;
                  padding: 1rem;
                  margin-bottom: 0.75rem;
                  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                .card-header {
                  display: flex;
                  align-items: center;
                  gap: 0.75rem;
                  margin-bottom: 0.5rem;
                  padding-bottom: 0.5rem;
                  border-bottom: 1px solid #f1f5f9;
                }
                .card-title {
                  font-size: 1rem;
                  font-weight: 600;
                  color: #1e293b;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                }
                
                table { width: 100%; border-collapse: collapse; }
                td { padding: 0.25rem 0; font-size: 0.875rem; }
                .label { color: #64748b; }
                .value { text-align: right; font-weight: 500; }
                
                .total-row { 
                  margin-top: 0.25rem;
                  padding-top: 0.25rem;
                  border-top: 1px solid #f1f5f9;
                  font-weight: 700;
                  font-size: 0.9375rem;
                  color: #4338ca;
                }
                
                .summary-card {
                  background: #4338ca;
                  color: white;
                  padding: 1rem;
                  border-radius: 0.75rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }
                .summary-label { font-size: 1rem; font-weight: 600; opacity: 0.9; }
                .summary-value { font-size: 1.25rem; font-weight: 700; }

                .formulas { 
                  margin-top: 0.5rem; 
                  padding: 0.75rem; 
                  border-radius: 0.5rem;
                  background-color: #f1f5f9; 
                  border-left: 4px solid #94a3b8;
                }
                .formulas h3 { margin: 0 0 0.25rem 0; font-size: 0.7rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                .formulas p { margin: 0.125rem 0; color: #1e293b; font-size: 0.7rem; line-height: 1.4; }
                
                .icon {
                  width: 1.25rem;
                  height: 1.25rem;
                  stroke-width: 2.5;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  fill: none;
                }
                .icon-water { stroke: #3b82f6; }
                .icon-electricity { stroke: #f59e0b; }
                .icon-internet { stroke: #a855f7; }

                @media print {
                  body { background-color: white; }
                  .card { box-shadow: none; border: 1px solid #e2e8f0; page-break-inside: avoid; }
                  .summary-card { background-color: #4338ca !important; -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <header>
                  <h1>Reporte de Gastos</h1>
                  <span class="date">${month} ${year}</span>
                </header>
                
                ${data.water ? `
                <div class="card">
                  <div class="card-header">
                    <h2 class="card-title">
                      <svg class="icon icon-water" viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
                      Agua
                    </h2>
                  </div>
                  <table>
                    <tr><td class="label">Total Facturado</td><td class="value">${formatCurrency(data.water.totalInvoiced)}</td></tr>
                    ${(data.water.discount ?? 0) > 0 ? `<tr><td class="label">Descuento</td><td class="value">-${formatCurrency(data.water.discount)}</td></tr>` : ''}
                    <tr class="total-row"><td class="label" style="color:#4338ca">Total a Pagar</td><td class="value">${formatCurrency(data.water.totalToPay)}</td></tr>
                  </table>
                </div>` : ''}
  
                ${data.electricity ? `
                <div class="card">
                  <div class="card-header">
                    <h2 class="card-title">
                      <svg class="icon icon-electricity" viewBox="0 0 24 24"><path d="M15 14c.2-1.1.7-2.1 1.5-2.8.8-.7 1.3-1.7 1.5-2.8.4-2.6-1.5-5.1-4.1-5.4-2.6-.4-5.1 1.5-5.4 4.1-.2 1.1 0 2.2.6 3.1.6.9 1 1.9 1.1 3"/><path d="M9 21h6"/><path d="M10 17h4"/></svg>
                      Electricidad
                    </h2>
                  </div>
                  <table>
                    <tr><td class="label">Total Facturado</td><td class="value">${formatCurrency(data.electricity.totalInvoiced)}</td></tr>
                    <tr><td class="label">Consumo (kWh)</td><td class="value">${data.electricity.kwhConsumption.toFixed(2)} kWh</td></tr>
                    <tr><td class="label">Costo por kWh</td><td class="value">${formatCurrency(data.electricity.kwhCost)}</td></tr>
                    <tr><td class="label">Contador Anterior</td><td class="value">${data.electricity.previousMeter}</td></tr>
                    <tr><td class="label">Contador Actual</td><td class="value">${data.electricity.currentMeter}</td></tr>
                    <tr><td class="label">Consumo del Contador</td><td class="value">${data.electricity.consumptionMeter.toFixed(0)}</td></tr>
                    <tr class="total-row"><td class="label" style="color:#4338ca">Total a Pagar</td><td class="value">${formatCurrency(data.electricity.totalToPay)}</td></tr>
                  </table>
                  <div class="formulas">
                    <h3>Cálculos Realizados</h3>
                    <p><b>Consumo del Contador</b> = Contador Actual - Contador Anterior</p>
                    <p><b>Costo por kWh</b> = Total Facturado / Consumo (kWh)</p>
                    <p><b>Total a Pagar</b> = Consumo del Contador * Costo por kWh</p>
                  </div>
                </div>
                ` : ''}
                
                ${data.internet ? `
                <div class="card">
                  <div class="card-header">
                    <h2 class="card-title">
                      <svg class="icon icon-internet" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                      Internet
                    </h2>
                  </div>
                  <table>
                    <tr><td class="label">Costo Mensual</td><td class="value">${formatCurrency(data.internet.monthlyCost)}</td></tr>
                    ${(data.internet.discount ?? 0) > 0 ? `<tr><td class="label">Descuento</td><td class="value">-${formatCurrency(data.internet.discount)}</td></tr>` : ''}
                    <tr class="total-row"><td class="label" style="color:#4338ca">Total a Pagar</td><td class="value">${formatCurrency(data.internet.totalToPay ?? data.internet.monthlyCost)}</td></tr>
                  </table>
                </div>` : ''}
  
                <div class="summary-card">
                  <span class="summary-label">Total Consolidado</span>
                  <span class="summary-value">${formatCurrency(data.total)}</span>
                </div>
              </div>
            </body>
          </html>
        `);
      printDocument.close();

      // Wait for content to load before printing
      iframe.onload = () => {
        iframe.contentWindow?.print();
        // Optional: remove iframe after a delay to ensure print dialog has opened
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  };

  const handlePrint = useCallback((monthKey: string, data: CombinedData) => {
    if (isMobile) {
      setPreviewData({ monthKey, data });
      setPreviewOpen(true);
    } else {
      handlePrintDesktop(monthKey, data);
    }
  }, [isMobile]);

  const { combinedData, sortedMonths } = useMemo(() => {
    const data: CombinedDataMap = {};
    const allRecords = [
      ...waterData.filter(d => d.year === selectedYear).map(d => ({ ...d, type: 'water' })),
      ...electricityData.filter(d => d.year === selectedYear).map(d => ({ ...d, type: 'electricity' })),
      ...internetData.filter(d => d.year === selectedYear).map(d => ({ ...d, type: 'internet' }))
    ];

    allRecords.forEach(record => {
      const key = `${record.month}-${record.year}`;
      if (!data[key]) {
        data[key] = { water: null, electricity: null, internet: null, total: 0 };
      }

      const value = 'monthlyCost' in record ? record.monthlyCost : ('totalToPay' in record ? record.totalToPay : 0);

      if (record.type === 'water') data[key].water = record as unknown as WaterRecord;
      if (record.type === 'electricity') data[key].electricity = record as unknown as ElectricityRecord;
      if (record.type === 'internet') data[key].internet = record as unknown as InternetRecord;

      data[key].total += value;
    });

    const monthsSorted = Object.keys(data).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');

      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearB) - parseInt(yearA);
      }

      return months.indexOf(monthB) - months.indexOf(monthA);
    });

    return { combinedData: data, sortedMonths: monthsSorted };
  }, [waterData, electricityData, internetData, selectedYear]);

  const handleExportCSV = useCallback(() => {
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
  }, [combinedData, sortedMonths]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Historial Consolidado" icon={History} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Resumen de Gastos por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedMonths.length > 0 ? (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedMonths.map((monthKey, index) => {
                    const [month, year] = monthKey.split('-');
                    const data = combinedData[monthKey];
                    return (
                      <div
                        key={monthKey}
                        className="glass-card rounded-lg border p-5 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-lg">{month} {year}</div>
                            <div className="text-sm font-bold text-primary">{formatCurrency(data.total)}</div>
                          </div>
                          <Button variant="outline" size="icon" onClick={() => handlePrint(monthKey, data)} className="h-9 w-9">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="h-px bg-border mb-3" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1"><Droplet className="h-3 w-3" /> Agua:</span>
                            <span className="font-medium">{formatCurrency(data.water?.totalToPay)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Electricidad:</span>
                            <span className="font-medium">{formatCurrency(data.electricity?.totalToPay)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1"><Wifi className="h-3 w-3" /> Internet:</span>
                            <span className="font-medium">{formatCurrency(data.internet?.totalToPay ?? data.internet?.monthlyCost)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View - Modern Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="font-bold">Mes</TableHead>
                        <TableHead className="text-right font-bold">
                          <span className="flex items-center justify-end gap-1"><Droplet className="h-4 w-4" /> Agua</span>
                        </TableHead>
                        <TableHead className="text-right font-bold">
                          <span className="flex items-center justify-end gap-1"><Lightbulb className="h-4 w-4" /> Electricidad</span>
                        </TableHead>
                        <TableHead className="text-right font-bold">
                          <span className="flex items-center justify-end gap-1"><Wifi className="h-4 w-4" /> Internet</span>
                        </TableHead>
                        <TableHead className="text-right font-bold text-primary">Total del Mes</TableHead>
                        <TableHead className="text-center font-bold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMonths.map(monthKey => {
                        const [month, year] = monthKey.split('-');
                        const data = combinedData[monthKey];
                        return (
                          <TableRow key={monthKey} className="hover:bg-muted/50 transition-colors duration-200">
                            <TableCell>
                              <div className="font-semibold">{month}</div>
                              <div className="text-sm text-muted-foreground">{year}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(data.water?.totalToPay)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(data.electricity?.totalToPay)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(data.internet?.totalToPay ?? data.internet?.monthlyCost)}</TableCell>
                            <TableCell className="text-right font-bold text-primary text-lg">{formatCurrency(data.total)}</TableCell>
                            <TableCell className="text-center">
                              <Button variant="outline" size="icon" onClick={() => handlePrint(monthKey, data)} className="h-9 w-9">
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
              <div className="text-center p-12 glass-card rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No hay datos disponibles</h3>
                <p className="text-muted-foreground">
                  Añade registros en las secciones de Agua, Electricidad e Internet para ver el historial.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button variant="outline" onClick={handleExportCSV} disabled={sortedMonths.length === 0} className="h-11 px-6">
              <Download className="mr-2 h-4 w-4" />
              Exportar a CSV
            </Button>
          </CardFooter>
        </Card>
      </main>


      <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Resumen de Gastos</DialogTitle>
            <DialogDescription className="text-sm">
              {previewData?.monthKey}
            </DialogDescription>
          </DialogHeader>
          {previewData && (
            <div className="space-y-2.5">
              {previewData.data.water && (
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="py-2 px-4 bg-muted/30">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" /> Consumo de Agua
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 space-y-1.5">
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Total Facturado:</span>
                      <span className="font-medium">{formatCurrency(previewData.data.water.totalInvoiced)}</span>
                    </div>
                    {(previewData.data.water.discount ?? 0) > 0 && (
                      <div className="text-sm flex justify-between text-green-600 dark:text-green-400">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(previewData.data.water.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1.5 mt-1.5 text-indigo-600 dark:text-indigo-400">
                      <span>Total a Pagar:</span>
                      <span>{formatCurrency(previewData.data.water.totalToPay)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {previewData.data.electricity && (
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="py-2 px-4 bg-muted/30">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Consumo de Electricidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 space-y-1.5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Total Facturado:</span>
                        <span className="font-medium">{formatCurrency(previewData.data.electricity.totalInvoiced)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consumo:</span>
                        <span className="font-medium">{previewData.data.electricity.kwhConsumption.toFixed(1)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo/kWh:</span>
                        <span className="font-medium">{formatCurrency(previewData.data.electricity.kwhCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lectura Ant:</span>
                        <span className="font-medium">{previewData.data.electricity.previousMeter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lectura Act:</span>
                        <span className="font-medium">{previewData.data.electricity.currentMeter}</span>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1.5 mt-1.5 text-indigo-600 dark:text-indigo-400">
                      <span>Total a Pagar:</span>
                      <span>{formatCurrency(previewData.data.electricity.totalToPay)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {previewData.data.internet && (
                <Card className="border shadow-sm overflow-hidden">
                  <CardHeader className="py-2 px-4 bg-muted/30">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-purple-500" /> Costo de Internet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 space-y-1.5">
                    <div className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Costo Mensual:</span>
                      <span className="font-medium">{formatCurrency(previewData.data.internet.monthlyCost)}</span>
                    </div>
                    {(previewData.data.internet.discount ?? 0) > 0 && (
                      <div className="text-sm flex justify-between text-green-600 dark:text-green-400">
                        <span>Descuento:</span>
                        <span>-{formatCurrency(previewData.data.internet.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-1.5 mt-1.5 text-indigo-600 dark:text-indigo-400">
                      <span>Total a Pagar:</span>
                      <span>{formatCurrency(previewData.data.internet.totalToPay ?? previewData.data.internet.monthlyCost)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="pt-1">
                <div className="bg-indigo-600 text-white rounded-lg p-3.5 flex justify-between items-center shadow-lg">
                  <span className="text-base font-semibold">Total Consolidado</span>
                  <span className="text-xl font-bold">{formatCurrency(previewData.data.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
