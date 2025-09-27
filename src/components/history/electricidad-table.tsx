
'use client';

import { useApp } from '@/lib/hooks/use-app';
import { useAuth } from '@/lib/hooks/use-auth';
import { ElectricityRecord } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { FilePenLine, Trash2, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

type ElectricidadTableProps = {
    onEdit: (record: ElectricityRecord) => void;
    data: ElectricityRecord[];
    isLoading: boolean;
};

export function ElectricidadTable({ onEdit, data, isLoading }: ElectricidadTableProps) {
  const { deleteElectricityRecord } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  const formatNumber = (num: number, digits = 2) => new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(num);

  const handleDelete = (id: string) => {
    deleteElectricityRecord(id);
    toast({
        title: "Registro eliminado",
        description: "El registro de electricidad ha sido eliminado.",
    })
  }

  const handleExportCSV = () => {
    const headers = [
      'Año', 'Mes', 'Total Facturado', 'Consumo kWh', 'Costo kWh', 
      'Contador Anterior', 'Contador Actual', 'Consumo Contador', 
      'Total a Pagar', 'Estado'
    ];
    const csvContent = [
      headers.join(','),
      ...data.map(r => 
        [
          r.year, r.month, r.totalInvoiced, r.kwhConsumption, r.kwhCost,
          r.previousMeter, r.currentMeter, r.consumptionMeter,
          r.totalToPay, r.status
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
  };

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
        {user?.role === 'Edición' && <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
      </TableRow>
    ))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Electricidad</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden">
          {isLoading && [...Array(2)].map((_, i) => (
             <div key={i} className="mb-4 rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-start">
                  <div className='space-y-2'>
                      <Skeleton className='h-5 w-28' />
                      <Skeleton className='h-4 w-20' />
                  </div>
                  <Skeleton className='h-6 w-20' />
              </div>
              <Skeleton className='h-px w-full' />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><Skeleton className='h-4 w-24' /> <Skeleton className='h-4 w-16' /></div>
                <div className="flex justify-between"><Skeleton className='h-4 w-20' /> <Skeleton className='h-4 w-12' /></div>
              </div>
            </div>
          ))}
          {!isLoading && data.map((record: ElectricityRecord) => (
            <div key={record.id} className="mb-4 rounded-lg border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{record.month} {record.year}</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(record.totalToPay)}</div>
                </div>
                <Badge variant={record.status === 'Pagado' ? 'secondary' : 'destructive'}>
                  {record.status}
                </Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Total Facturado:</span> <span>{formatCurrency(record.totalInvoiced)}</span></div>
                <div className="flex justify-between"><span>Consumo kWh:</span> <span>{formatNumber(record.kwhConsumption)}</span></div>
                <div className="flex justify-between"><span>Costo kWh:</span> <span>{formatCurrency(record.kwhCost)}</span></div>
              </div>
              {user?.role === 'Edición' && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(record.id)}>Continuar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Año/Mes</TableHead>
                <TableHead className="text-right">Total Facturado</TableHead>
                <TableHead className="text-right">Consumo kWh</TableHead>
                <TableHead className="text-right">Costo kWh</TableHead>
                <TableHead className="text-right">Total a Pagar</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                {user?.role === 'Edición' && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : data.map((record: ElectricityRecord) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="font-medium">{record.year}</div>
                    <div className="text-sm text-muted-foreground">{record.month}</div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(record.totalInvoiced)}</TableCell>
                  <TableCell className="text-right">{formatNumber(record.kwhConsumption)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.kwhCost)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.totalToPay)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={record.status === 'Pagado' ? 'secondary' : 'destructive'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  {user?.role === 'Edición' && (
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                        <FilePenLine className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el registro.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(record.id)}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleExportCSV} disabled={data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </CardFooter>
    </Card>
  );
}
