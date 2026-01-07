
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
import { FilePenLine, Trash2, Download, Droplet } from 'lucide-react';
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Historial de Agua</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && [...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg border p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-4 w-24' />
                </div>
                <Skeleton className='h-6 w-20' />
              </div>
              <Skeleton className='h-px w-full' />
              <div className="space-y-2">
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            </div>
          ))}

          {!isLoading && data.map((record: WaterRecord, index) => (
            <div
              key={record.id}
              className="glass-card rounded-lg border p-5 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{record.month} {record.year}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Droplet className="h-3 w-3" />
                    Consumo de agua
                  </p>
                </div>
                <Badge variant={record.status === 'Pagado' ? 'secondary' : 'destructive'} className="text-xs">
                  {record.status}
                </Badge>
              </div>

              <div className="h-px bg-border mb-4" />

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Facturado</span>
                  <span className="font-medium">{formatCurrency(record.totalInvoiced)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-{formatCurrency(record.discount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total a Pagar</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(record.totalToPay)}</span>
                </div>
              </div>

              {/* Actions */}
              {user?.role === 'Edición' && (
                <div className="flex gap-2 pt-4 border-t mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => onEdit(record)}
                    className="flex-1 h-10 gap-2 font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <FilePenLine className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 h-10 gap-2 font-medium text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
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
      </CardContent>
    </Card>
  );
}
