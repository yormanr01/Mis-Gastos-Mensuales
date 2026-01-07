
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
import { PlusCircle, Search } from 'lucide-react';
import type { WaterRecord, ElectricityRecord, InternetRecord } from '@/lib/types';
import { useApp } from '@/lib/hooks/use-app';
import { Input } from '@/components/ui/input';
import { useMemo } from 'react';

type RecordType = WaterRecord | ElectricityRecord | InternetRecord;

type ServiceHistoryProps<T extends RecordType> = {
  serviceName: string;
  FormComponent: React.ComponentType<{ setOpen: (open: boolean) => void; recordToEdit?: T | null }>;
  TableComponent: React.ComponentType<{ onEdit: (record: T) => void; data: T[]; isLoading: boolean }>;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
};

export function ServiceHistory<T extends RecordType>({
  serviceName,
  FormComponent,
  TableComponent,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
}: ServiceHistoryProps<T>) {
  const { user } = useAuth();
  const { waterData, electricityData, internetData, isLoading } = useApp();

  const [internalSearchTerm, setInternalSearchTerm] = useState('');

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const setSearchTerm = externalOnSearchChange !== undefined ? externalOnSearchChange : setInternalSearchTerm;

  const rawData = useMemo(() => {
    let d: T[] = [];
    if (serviceName === 'Agua') d = waterData as T[];
    if (serviceName === 'Electricidad') d = electricityData as T[];
    if (serviceName === 'Internet') d = internetData as T[];
    return d;
  }, [serviceName, waterData, electricityData, internetData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return rawData;
    const lowerSearch = searchTerm.toLowerCase();
    return rawData.filter(record => {
      const monthMatch = record.month.toLowerCase().includes(lowerSearch);
      const yearMatch = record.year.toString().includes(lowerSearch);
      return monthMatch || yearMatch;
    });
  }, [rawData, searchTerm]);

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
    <div className="flex flex-col">
      {user?.role === 'Edición' && (
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-24 md:bottom-8 right-6 z-50 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 h-16 w-16 md:h-12 md:w-auto md:rounded-2xl md:px-8 md:text-lg"
              onClick={handleAddNew}
            >
              <PlusCircle className="h-10 w-10 md:mr-3 md:h-6 md:w-6" />
              <span className="hidden md:inline">Añadir Registro</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{recordToEdit ? 'Editar' : 'Nuevo'} Registro de {serviceName}</DialogTitle>
            </DialogHeader>
            <FormComponent setOpen={setFormOpen} recordToEdit={recordToEdit} />
          </DialogContent>
        </Dialog>
      )}

      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar registros en ${serviceName} por mes o año...`}
            className="pl-10 h-11 glass-card border-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredData.length > 0 ? (
        <TableComponent
          onEdit={handleEdit}
          data={filteredData}
          isLoading={isLoading}
        />
      ) : (
        <div className="text-center p-12 glass-card rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? `No hay registros en ${serviceName} que coincidan con "${searchTerm}"`
              : `Añade registros en la sección de ${serviceName} para ver el historial.`
            }
          </p>
        </div>
      )}
    </div>
  );
}
