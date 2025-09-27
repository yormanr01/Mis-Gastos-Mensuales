
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { electricityFormSchema, type ElectricityFormValues } from '@/lib/schemas';
import { months, ElectricityRecord } from '@/lib/types';
import { useApp } from '@/lib/hooks/use-app';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type ElectricidadFormProps = {
  setOpen: (open: boolean) => void;
  recordToEdit?: ElectricityRecord | null;
};

export function ElectricidadForm({ setOpen, recordToEdit }: ElectricidadFormProps) {
  const { addElectricityRecord, updateElectricityRecord, electricityData } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  const getLastMeterReading = () => {
    if (electricityData.length > 0) {
      const sortedData = [...electricityData].sort((a,b) => {
        if (a.year !== b.year) return b.year - a.year;
        return months.indexOf(b.month) - months.indexOf(a.month);
      });
      return sortedData[0].currentMeter;
    }
    return 0;
  };

  const form = useForm<ElectricityFormValues>({
    resolver: zodResolver(electricityFormSchema),
    defaultValues: recordToEdit ? {
        ...recordToEdit,
    } : {
      year: currentYear,
      month: currentMonth,
      status: 'Pendiente',
      previousMeter: getLastMeterReading(),
      totalInvoiced: '' as any,
      kwhConsumption: '' as any,
      currentMeter: '' as any,
    },
  });

  useEffect(() => {
    if (recordToEdit) {
      form.reset(recordToEdit);
    } else {
      form.reset({
        year: currentYear,
        month: currentMonth,
        status: 'Pendiente',
        previousMeter: getLastMeterReading(),
        totalInvoiced: '' as any,
        kwhConsumption: '' as any,
        currentMeter: '' as any,
      });
    }
  }, [recordToEdit, form, currentYear, currentMonth, electricityData]);

  const { watch } = form;
  const totalInvoiced = watch('totalInvoiced');
  const kwhConsumption = watch('kwhConsumption');
  const previousMeter = watch('previousMeter');
  const currentMeter = watch('currentMeter');

  const kwhCost = (Number(totalInvoiced) > 0 && Number(kwhConsumption) > 0) ? Number(totalInvoiced) / Number(kwhConsumption) : 0;
  const consumptionMeter = Number(currentMeter) > Number(previousMeter) ? Math.round(Number(currentMeter) - Number(previousMeter)) : 0;
  const totalToPay = consumptionMeter * kwhCost;

  async function onSubmit(values: ElectricityFormValues) {
    setIsSubmitting(true);
    
    const calculatedKwhCost = (Number(values.totalInvoiced) > 0 && Number(values.kwhConsumption) > 0) ? Number(values.totalInvoiced) / Number(values.kwhConsumption) : 0;
    const calculatedConsumptionMeter = Number(values.currentMeter) > Number(values.previousMeter) ? Math.round(Number(values.currentMeter) - Number(values.previousMeter)) : 0;
    const calculatedTotalToPay = calculatedConsumptionMeter * calculatedKwhCost;
    
    const finalValues = {
        ...values,
        kwhCost: parseFloat(calculatedKwhCost.toFixed(2)),
        consumptionMeter: calculatedConsumptionMeter,
        totalToPay: parseFloat(calculatedTotalToPay.toFixed(2))
    };

    try {
        if(recordToEdit) {
            await updateElectricityRecord({...finalValues, id: recordToEdit.id });
            toast({
                title: "Registro actualizado",
                description: "El registro de consumo de electricidad ha sido actualizado.",
            });
        } else {
            await addElectricityRecord(finalValues);
            toast({
                title: "Registro exitoso",
                description: "El registro de consumo de electricidad ha sido añadido.",
            });
        }
        setOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error al guardar",
            description: error.message || "No se pudo guardar el registro. Inténtalo de nuevo.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="year" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Año</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="month" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Mes</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} >
              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un mes" /></SelectTrigger></FormControl>
              <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="totalInvoiced" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Total Facturado ($)</FormLabel>
            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="kwhConsumption" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Consumo kWh</FormLabel>
            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="previousMeter" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Contador Anterior</FormLabel>
            <FormControl><Input type="number" step="1" {...field} readOnly={!recordToEdit && electricityData.length > 0} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="currentMeter" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Contador Actual</FormLabel>
            <FormControl><Input type="number" step="1" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <div className="p-3 bg-muted/50 rounded-md space-y-1 text-sm">
            <p>Costo kWh: <strong>${kwhCost.toFixed(2)}</strong></p>
            <p>Consumo Contador: <strong>{consumptionMeter.toFixed(0)} kWh</strong></p>
            <p className="font-bold text-base">Total a Pagar: <strong>{formatCurrency(totalToPay)}</strong></p>
        </div>

        <FormField name="status" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Estado</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} >
              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Form>
  );
}
