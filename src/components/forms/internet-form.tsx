
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
        ...recordToEdit
    } : {
      year: currentYear,
      month: currentMonth,
      monthlyCost: fixedValues.internetMonthlyCost,
    },
  });

  useEffect(() => {
    if (recordToEdit) {
        form.reset(recordToEdit);
    } else {
        form.reset({
            year: currentYear,
            month: currentMonth,
            monthlyCost: fixedValues.internetMonthlyCost || '' as any,
        });
    }
  }, [recordToEdit, form, currentYear, currentMonth, fixedValues]);

  async function onSubmit(values: InternetFormValues) {
    setIsSubmitting(true);
    try {
        if (recordToEdit) {
            await updateInternetRecord({ ...values, id: recordToEdit.id });
            toast({
                title: "Registro actualizado",
                description: "El registro de costo de internet ha sido actualizado.",
            });
        } else {
            await addInternetRecord(values);
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
          name="monthlyCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo Mensual ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ej: 45.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Form>
  );
}
