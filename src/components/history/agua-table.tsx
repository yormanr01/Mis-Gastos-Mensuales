
'use client';

import { useApp } from '@/lib/hooks/use-app';
import { useAuth } from '@/lib/hooks/use-auth';
import { WaterRecord } from '@/lib/types';
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
import Link from 'next/link';

type AguaTableProps = {
    onEdit: (record: WaterRecord) => void;
    data: WaterRecord[];
    isLoading: boolean;
};

export function AguaTable({ onEdit, data, isLoading }: AguaTableProps) {
  const { deleteWaterRecord } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleDelete = (id: string) => {
    deleteWaterRecord(id);
    toast({
        title: "Registro eliminado",
        description: "El registro de agua ha sido eliminado.",
    })
  }
  
  const handleExportCSV = () => {
    const headers = ['Año', 'Mes', 'Total Facturado', 'Descuento', 'Total a Pagar', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...data.map(r => 
        [r.year, r.month, r.totalInvoiced, r.discount, r.totalToPay, r.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'historial_agua.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
        <CardTitle>Historial de Agua</CardTitle>
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
          {!isLoading && data.map((record: WaterRecord) => (
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
                <div className="flex justify-between"><span>Descuento:</span> <span>{formatCurrency(record.discount)}</span></div>
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
                <TableHead>Año</TableHead>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Total Facturado</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Total a Pagar</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                {user?.role === 'Edición' && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : data.map((record: WaterRecord) => (
                <TableRow key={record.id}>
                  <TableCell>{record.year}</TableCell>
                  <TableCell>{record.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.totalInvoiced)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.discount)}</TableCell>
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
