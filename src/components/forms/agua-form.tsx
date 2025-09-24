
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
import { waterFormSchema, type WaterFormValues } from '@/lib/schemas';
import { months, WaterRecord } from '@/lib/types';
import { useApp } from '@/lib/hooks/use-app';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type AguaFormProps = {
  setOpen: (open: boolean) => void;
  recordToEdit?: WaterRecord | null;
};

export function AguaForm({ setOpen, recordToEdit }: AguaFormProps) {
  const { addWaterRecord, updateWaterRecord, fixedValues } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  const form = useForm<WaterFormValues>({
    resolver: zodResolver(waterFormSchema),
    defaultValues: recordToEdit ? {
        ...recordToEdit
    } : {
      year: currentYear,
      month: currentMonth,
      totalInvoiced: '' as any,
      discount: fixedValues.waterDiscount,
      status: 'Pendiente',
    },
  });
  
  useEffect(() => {
    if (recordToEdit) {
      form.reset(recordToEdit);
    } else {
      form.reset({
        year: currentYear,
        month: currentMonth,
        totalInvoiced: '' as any, // Set to empty string to avoid uncontrolled input error
        discount: fixedValues.waterDiscount,
        status: 'Pendiente',
      });
    }
  }, [recordToEdit, form, currentYear, currentMonth, fixedValues]);

  const { watch, setValue } = form;
  const totalInvoiced = watch('totalInvoiced');
  const discount = watch('discount');

  useEffect(() => {
    const total = (Number(totalInvoiced) || 0) - (Number(discount) || 0);
    setValue('totalToPay', total >= 0 ? total : 0, { shouldValidate: true });
  }, [totalInvoiced, discount, setValue]);

  async function onSubmit(values: WaterFormValues) {
    setIsSubmitting(true);
    const totalToPay = values.totalInvoiced - values.discount;
    
    try {
        if (recordToEdit) {
            await updateWaterRecord({ ...values, id: recordToEdit.id, totalToPay });
            toast({
                title: "Registro actualizado",
                description: "El registro de consumo de agua ha sido actualizado.",
            });
        } else {
            await addWaterRecord({ ...values, totalToPay });
            toast({
                title: "Registro exitoso",
                description: "El registro de consumo de agua ha sido añadido.",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Año</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ej: 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mes</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un mes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="totalInvoiced"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Facturado ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ej: 25.50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descuento ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ej: 2.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
            <p className="text-sm font-medium">Total a Pagar: ${form.watch('totalToPay')?.toFixed(2) || '0.00'}</p>
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Form>
  );
}
