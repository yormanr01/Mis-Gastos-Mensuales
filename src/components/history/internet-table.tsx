
'use client';

import { useApp } from '@/lib/hooks/use-app';
import { useAuth } from '@/lib/hooks/use-auth';
import { InternetRecord } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { FilePenLine, Trash2 } from 'lucide-react';
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


type InternetTableProps = {
    onEdit: (record: InternetRecord) => void;
    data: InternetRecord[];
    isLoading: boolean;
};

export function InternetTable({ onEdit, data, isLoading }: InternetTableProps) {
  const { deleteInternetRecord } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleDelete = (id: string) => {
    deleteInternetRecord(id);
    toast({
        title: "Registro eliminado",
        description: "El registro de internet ha sido eliminado.",
    })
  }

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        {user?.role === 'Edición' && <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
      </TableRow>
    ))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Internet</CardTitle>
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
              </div>
            </div>
          ))}
          {!isLoading && data.map((record: InternetRecord) => (
            <div key={record.id} className="mb-4 rounded-lg border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{record.month} {record.year}</div>
                  <div className="text-sm text-muted-foreground">{formatCurrency(record.monthlyCost)}</div>
                </div>
                {user?.role === 'Edición' && (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Eliminar
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
                <TableHead className="text-right">Costo Mensual</TableHead>
                {user?.role === 'Edición' && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeleton() : data.map((record: InternetRecord) => (
                <TableRow key={record.id}>
                  <TableCell>{record.year}</TableCell>
                  <TableCell>{record.month}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.monthlyCost)}</TableCell>
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
    </Card>
  );
}
