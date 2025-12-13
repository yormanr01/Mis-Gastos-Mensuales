'use server';

import { ai } from './genkit';
import { WaterRecord, ElectricityRecord, InternetRecord } from '@/lib/types';

export async function generateExpenseInsights(
    water: WaterRecord[],
    electricity: ElectricityRecord[],
    internet: InternetRecord[]
) {
    try {
        const prompt = `
      Analiza los siguientes datos de gastos y proporciona 3 ideas o consejos breves y prácticos.
      Enfócate en tendencias, anomalías o posibles ahorros.
      Mantén un tono útil y alentador.
      Responde SIEMPRE en Español.
      
      Datos de Agua: ${JSON.stringify(water.slice(-6))}
      Datos de Electricidad: ${JSON.stringify(electricity.slice(-6))}
      Datos de Internet: ${JSON.stringify(internet.slice(-6))}
      
      Formatea la salida como una lista simple de 3 puntos.
    `;

        const { text } = await ai.generate(prompt);
        return text;
    } catch (error) {
        console.error("Error generating insights:", error);
        return "Unable to generate insights at this time.";
    }
}
