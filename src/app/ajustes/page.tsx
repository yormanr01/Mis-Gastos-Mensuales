
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useTheme } from 'next-themes';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/hooks/use-app";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Droplet, Lightbulb, Wifi, Moon, Sun, Monitor, Palette } from 'lucide-react';

const fixedValuesSchema = z.object({
  waterDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
  electricityDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
  internetDiscount: z.coerce.number().min(0, "El descuento debe ser un número positivo."),
});

type FixedValuesForm = z.infer<typeof fixedValuesSchema>;

import { PageHeader } from "@/components/page-header";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { fixedValues, setFixedValues } = useApp();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
      description: "Los ajustes se han guardado correctamente.",
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
      <PageHeader title="Ajustes" icon={Settings} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Apariencia Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza cómo se ve la aplicación en tu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant={mounted && theme === 'light' ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 transition-all ${mounted && theme === 'light' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Claro</span>
                </Button>
                <Button
                  variant={mounted && theme === 'dark' ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 transition-all ${mounted && theme === 'dark' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Oscuro</span>
                </Button>
                <Button
                  variant={mounted && theme === 'system' ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 transition-all ${mounted && theme === 'system' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">Sistema</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Valores Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Configuración de Valores
              </CardTitle>
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
