
import type { WaterRecord, ElectricityRecord, InternetRecord, Status } from './types';

export const sortRecords = (a: { year: number, month: string }, b: { year: number, month: string }) => {
    const monthOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    if (a.year !== b.year) return b.year - a.year;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
};
