
export type Status = 'Pendiente' | 'Pagado';

export const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface BaseRecord {
  id: string;
  year: number;
  month: string;
}

export interface WaterRecord extends BaseRecord {
  totalInvoiced: number;
  discount: number;
  totalToPay: number;
  status: Status;
}

export interface ElectricityRecord extends BaseRecord {
  totalInvoiced: number;
  kwhConsumption: number;
  kwhCost: number;
  previousMeter: number;
  currentMeter: number;
  consumptionMeter: number;
  totalToPay: number;
  status: Status;
}

export interface InternetRecord extends BaseRecord {
  monthlyCost: number;
}

export interface FixedValues {
    waterDiscount: number;
    internetMonthlyCost: number;
}

export type Role = 'Edición' | 'Visualización';
export type UserStatus = 'Activo' | 'Inactivo';

export interface User {
  id: string;
  email: string;
  password?: string; // Should not be stored in client-side state long-term
  role: Role;
  status: UserStatus;
}
