
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import type { WaterRecord, ElectricityRecord, InternetRecord } from '@/lib/types';
import { useApp } from '@/lib/hooks/use-app';

type RecordType = WaterRecord | ElectricityRecord | InternetRecord;

type ServiceHistoryProps<T extends RecordType> = {
  serviceName: string;
  FormComponent: React.ComponentType<{ setOpen: (open: boolean) => void; recordToEdit?: T | null }>;
  TableComponent: React.ComponentType<{ onEdit: (record: T) => void; data: T[]; isLoading: boolean }>;
};

export function ServiceHistory<T extends RecordType>({
  serviceName,
  FormComponent,
  TableComponent,
}: ServiceHistoryProps<T>) {
  const { user } = useAuth();
  const { waterData, electricityData, internetData, isLoading } = useApp();

  let data: T[] = [];
  if (serviceName === 'Agua') data = waterData as T[];
  if (serviceName === 'Electricidad') data = electricityData as T[];
  if (serviceName === 'Internet') data = internetData as T[];

  const [isFormOpen, setFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<T | null>(null);

  const handleEdit = (record: T) => {
    setRecordToEdit(record);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setRecordToEdit(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {user?.role === 'Edición' && (
        <div className="flex justify-end">
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{recordToEdit ? 'Editar' : 'Nuevo'} Registro de {serviceName}</DialogTitle>
              </DialogHeader>
              <FormComponent setOpen={setFormOpen} recordToEdit={recordToEdit} />
            </DialogContent>
          </Dialog>
        </div>
      )}
      <TableComponent
        onEdit={handleEdit}
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}
