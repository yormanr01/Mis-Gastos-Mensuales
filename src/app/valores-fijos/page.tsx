
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/hooks/use-app";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Droplet, Lightbulb, Wifi } from 'lucide-react';

const fixedValuesSchema = z.object({
  waterDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
  electricityDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
  internetDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
});

type FixedValuesForm = z.infer<typeof fixedValuesSchema>;

export default function FixedValuesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { fixedValues, setFixedValues } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    // Correct logic: if loading is finished AND the user's role is NOT 'Edición'
    if (!isLoading && user && user.role !== 'Edición') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const form = useForm<FixedValuesForm>({
    resolver: zodResolver(fixedValuesSchema),
    defaultValues: fixedValues,
  });

  // Update form default values when fixedValues from context changes
  useEffect(() => {
    form.reset(fixedValues);
  }, [fixedValues, form]);


  const onSubmit = (data: FixedValuesForm) => {
    setFixedValues(data);
    toast({
      title: "Valores actualizados",
      description: "Los valores fijos se han guardado correctamente.",
    });
  };

  // This component should only render content for 'Edición' users or during loading.
  if (isLoading || !user || user.role !== 'Edición') {
    return (
      <div className="flex flex-col h-full">

        <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
          <p>Cargando o redirigiendo...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Configuración de Valores</CardTitle>
              <CardDescription>
                Establece los descuentos predeterminados para cada servicio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="waterDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center gap-2">
                            <Droplet className="h-4 w-4" />
                            Descuento de Agua ($)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-11 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="electricityDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Descuento de Electricidad ($)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-11 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="internetDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold flex items-center gap-2">
                            <Wifi className="h-4 w-4" />
                            Descuento de Internet ($)
                          </FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" className="h-11 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="h-11 px-6">Guardar Cambios</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
