
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
import { internetFormSchema, type InternetFormValues } from '@/lib/schemas';
import { months, InternetRecord } from '@/lib/types';
import { useApp } from '@/lib/hooks/use-app';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

type InternetFormProps = {
  setOpen: (open: boolean) => void;
  recordToEdit?: InternetRecord | null;
};

export function InternetForm({ setOpen, recordToEdit }: InternetFormProps) {
  const { addInternetRecord, updateInternetRecord, fixedValues } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  const form = useForm<InternetFormValues>({
    resolver: zodResolver(internetFormSchema),
    defaultValues: recordToEdit ? {
      ...recordToEdit,
      discount: recordToEdit.discount ?? fixedValues.internetDiscount,
      status: recordToEdit.status ?? 'Pendiente',
    } : {
      year: currentYear,
      month: currentMonth,
      monthlyCost: '' as any,
      discount: fixedValues.internetDiscount,
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
        monthlyCost: '' as any,
        discount: fixedValues.internetDiscount,
        status: 'Pendiente',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordToEdit, currentYear, currentMonth, fixedValues.internetDiscount]);

  const { watch, setValue } = form;
  const monthlyCost = watch('monthlyCost');
  const discount = watch('discount');

  useEffect(() => {
    const total = (Number(monthlyCost) || 0) - (Number(discount) || 0);
    setValue('totalToPay', total >= 0 ? total : 0, { shouldValidate: true });
  }, [monthlyCost, discount, setValue]);

  async function onSubmit(values: InternetFormValues) {
    setIsSubmitting(true);
    const totalToPay = parseFloat(((Number(values.monthlyCost) || 0) - (Number(values.discount) || 0)).toFixed(2));

    try {
      if (recordToEdit) {
        await updateInternetRecord({ ...values, id: recordToEdit.id, totalToPay });
        toast({
          title: "Registro actualizado",
          description: "El registro de costo de internet ha sido actualizado.",
        });
      } else {
        await addInternetRecord({ ...values, totalToPay });
        toast({
          title: "Registro exitoso",
          description: "El registro de costo de internet ha sido añadido.",
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
            name="monthlyCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Costo Mensual ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ej: 45.00" className="h-11 text-lg" {...field} />
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
