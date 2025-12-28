
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
import { Switch } from '@/components/ui/switch';

type ElectricidadFormProps = {
  setOpen: (open: boolean) => void;
  recordToEdit?: ElectricityRecord | null;
};

export function ElectricidadForm({ setOpen, recordToEdit }: ElectricidadFormProps) {
  const { addElectricityRecord, updateElectricityRecord, electricityData, fixedValues } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  const getLastMeterReading = () => {
    if (electricityData.length > 0) {
      const sortedData = [...electricityData].sort((a, b) => {
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
      discount: recordToEdit.discount ?? fixedValues.electricityDiscount,
    } : {
      year: currentYear,
      month: currentMonth,
      status: 'Pendiente',
      previousMeter: getLastMeterReading(),
      totalInvoiced: '' as any,
      kwhConsumption: '' as any,
      currentMeter: '' as any,
      discount: fixedValues.electricityDiscount,
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
        discount: fixedValues.electricityDiscount,
      });
    }
  }, [recordToEdit, form, currentYear, currentMonth, electricityData, fixedValues]);

  const { watch, setValue } = form;
  const totalInvoiced = watch('totalInvoiced');
  const kwhConsumption = watch('kwhConsumption');
  const previousMeter = watch('previousMeter');
  const currentMeter = watch('currentMeter');
  const discount = watch('discount');

  const kwhCost = (Number(totalInvoiced) > 0 && Number(kwhConsumption) > 0) ? Number(totalInvoiced) / Number(kwhConsumption) : 0;
  const consumptionMeter = Number(currentMeter) > Number(previousMeter) ? Math.round(Number(currentMeter) - Number(previousMeter)) : 0;
  const subtotal = consumptionMeter * kwhCost;

  useEffect(() => {
    const total = subtotal - (Number(discount) || 0);
    setValue('totalToPay', total >= 0 ? total : 0, { shouldValidate: true });
  }, [subtotal, discount, setValue]);

  async function onSubmit(values: ElectricityFormValues) {
    setIsSubmitting(true);

    const calculatedKwhCost = (Number(values.totalInvoiced) > 0 && Number(values.kwhConsumption) > 0) ? Number(values.totalInvoiced) / Number(values.kwhConsumption) : 0;
    const calculatedConsumptionMeter = Number(values.currentMeter) > Number(values.previousMeter) ? Math.round(Number(values.currentMeter) - Number(values.previousMeter)) : 0;
    const calculatedSubtotal = calculatedConsumptionMeter * calculatedKwhCost;
    const calculatedTotalToPay = calculatedSubtotal - Number(values.discount);

    const finalValues = {
      ...values,
      kwhCost: parseFloat(calculatedKwhCost.toFixed(2)),
      consumptionMeter: calculatedConsumptionMeter,
      totalToPay: parseFloat(calculatedTotalToPay.toFixed(2))
    };

    try {
      if (recordToEdit) {
        await updateElectricityRecord({ ...finalValues, id: recordToEdit.id });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="year" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Año</FormLabel>
              <FormControl><Input type="number" placeholder="Ej: 2024" className="h-11" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="month" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Mes</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Selecciona un mes" /></SelectTrigger></FormControl>
                <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Invoice Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="totalInvoiced" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Total Facturado ($)</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="Ej: 25.50" className="h-11 text-lg" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="kwhConsumption" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Consumo kWh</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="Ej: 150.00" className="h-11 text-lg" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Meter Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="previousMeter" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Contador Anterior</FormLabel>
              <FormControl><Input type="number" step="1" className="h-11 text-lg" {...field} readOnly={!recordToEdit && electricityData.length > 0} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="currentMeter" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Contador Actual</FormLabel>
              <FormControl><Input type="number" step="1" placeholder="Ej: 12500" className="h-11 text-lg" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Discount Field */}
        <FormField name="discount" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold">Descuento ($)</FormLabel>
            <FormControl><Input type="number" step="0.01" className="h-11 text-lg" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Calculated Summary */}
        <div className="glass-card p-5 rounded-lg border-primary/30 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Costo por kWh</span>
            <span className="font-medium">${kwhCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consumo Medidor</span>
            <span className="font-medium">{consumptionMeter.toFixed(0)} kWh</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Descuento</span>
            <span className="font-medium text-green-600 dark:text-green-400">-${(Number(discount) || 0).toFixed(2)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total a Pagar</span>
            <span className="text-3xl font-bold text-primary">${form.watch('totalToPay')?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Status Field */}
        <FormField name="status" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base font-semibold">
                Estado del Pago
              </FormLabel>
              <p className="text-sm text-muted-foreground">
                {field.value === 'Pagado' ? 'Marcado como pagado' : 'Pendiente de pago'}
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value === 'Pagado'}
                onCheckedChange={(checked) => field.onChange(checked ? 'Pagado' : 'Pendiente')}
              />
            </FormControl>
          </FormItem>
        )} />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting} className="h-11 px-6">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6">
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
