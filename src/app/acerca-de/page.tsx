import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Acerca de Mis Gastos" icon={Info} />
      <main className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="items-center text-center">
            <CircleDollarSign className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-2xl">Mis Gastos Mensuales</CardTitle>
            <CardDescription>Versión 1.1.0</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>
              Esta aplicación está diseñada para ofrecerte una solución centralizada y eficiente para el seguimiento de los gastos en servicios esenciales.
            </p>
            <p>
              Registra y visualiza el historial de tus consumos de agua, electricidad e internet para tener un control claro y detallado de tus finanzas mes a mes.
            </p>
            <p className="text-sm text-muted-foreground pt-4">
              Desarrollado por: r.yorman@gmail.com
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
