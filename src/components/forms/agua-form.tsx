
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
import { Switch } from '@/components/ui/switch';

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
      // Solo resetear si los valores por defecto cambian o si no hay un registro en edición
      form.reset({
        year: currentYear,
        month: currentMonth,
        totalInvoiced: '' as any,
        discount: fixedValues.waterDiscount,
        status: 'Pendiente',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordToEdit, currentYear, currentMonth, fixedValues.waterDiscount]);

  const { watch, setValue } = form;
  const totalInvoiced = watch('totalInvoiced');
  const discount = watch('discount');

  useEffect(() => {
    const total = (Number(totalInvoiced) || 0) - (Number(discount) || 0);
    setValue('totalToPay', total >= 0 ? total : 0, { shouldValidate: true });
  }, [totalInvoiced, discount, setValue]);

  async function onSubmit(values: WaterFormValues) {
    setIsSubmitting(true);
    const totalToPay = parseFloat((values.totalInvoiced - values.discount).toFixed(2));

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date Fields - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Año</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 2024" className="h-11" {...field} />
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
                <FormLabel className="text-sm font-semibold">Mes</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
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
        </div>

        {/* Amount Fields - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalInvoiced"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Total Facturado ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ej: 25.50" className="h-11 text-lg" {...field} />
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
                <FormLabel className="text-sm font-semibold">Descuento ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ej: 2.00" className="h-11 text-lg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Calculated Total - Highlighted */}
        <div className="glass-card p-4 rounded-lg border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
          <p className="text-3xl font-bold text-primary">${form.watch('totalToPay')?.toFixed(2) || '0.00'}</p>
        </div>

        {/* Status Field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
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
          )}
        />

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
