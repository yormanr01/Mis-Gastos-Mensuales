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
      Analyze the following expense data and provide 3 short, actionable insights or observations.
      Focus on trends, anomalies, or potential savings.
      Keep the tone helpful and encouraging.
      
      Water Data: ${JSON.stringify(water.slice(-6))}
      Electricity Data: ${JSON.stringify(electricity.slice(-6))}
      Internet Data: ${JSON.stringify(internet.slice(-6))}
      
      Format the output as a simple list of 3 bullet points.
    `;

        const { text } = await ai.generate(prompt);
        return text;
    } catch (error) {
        console.error("Error generating insights:", error);
        return "Unable to generate insights at this time.";
    }
}
