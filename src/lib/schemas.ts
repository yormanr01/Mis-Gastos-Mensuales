
import { z } from 'zod';
import { months } from './types';

const requiredError = "Este campo es requerido.";
const numericField = z.coerce.number({ required_error: requiredError }).min(0, { message: "Debe ser un número positivo." });
const integerField = numericField.int({ message: "Debe ser un número entero." });

export const waterFormSchema = z.object({
  year: numericField.refine(val => val >= 2000 && val <= new Date().getFullYear() + 1, { message: "Año inválido." }),
  month: z.enum(months as [string, ...string[]], { required_error: "Mes es requerido." }),
  totalInvoiced: numericField,
  discount: numericField,
  totalToPay: numericField.optional(), // Calculated field
  status: z.enum(['Pendiente', 'Pagado'], { required_error: "Estado es requerido." }),
});

export const electricityFormSchema = z.object({
  year: numericField.refine(val => val >= 2000 && val <= new Date().getFullYear() + 1, { message: "Año inválido." }),
  month: z.enum(months as [string, ...string[]], { required_error: "Mes es requerido." }),
  totalInvoiced: numericField,
  kwhConsumption: numericField,
  previousMeter: integerField,
  currentMeter: integerField,
  status: z.enum(['Pendiente', 'Pagado'], { required_error: "Estado es requerido." }),
}).refine((data) => data.currentMeter >= data.previousMeter, {
  message: "El contador actual debe ser mayor o igual que el contador anterior.",
  path: ["currentMeter"],
});

export const internetFormSchema = z.object({
  year: numericField.refine(val => val >= 2000 && val <= new Date().getFullYear() + 1, { message: "Año inválido." }),
  month: z.enum(months as [string, ...string[]], { required_error: "Mes es requerido." }),
  monthlyCost: numericField,
});

export type WaterFormValues = z.infer<typeof waterFormSchema>;
export type ElectricityFormValues = z.infer<typeof electricityFormSchema>;
export type InternetFormValues = z.infer<typeof internetFormSchema>;
