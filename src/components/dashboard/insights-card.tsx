'use client';

import { useState } from 'react';
import { useApp } from '@/lib/hooks/use-app';
import { generateExpenseInsights } from '@/ai/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

export function InsightsCard() {
    const { waterData, electricityData, internetData } = useApp();
    const [insights, setInsights] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateExpenseInsights(waterData, electricityData, internetData);
            // Split by newlines and clean up
            const lines = result
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => line.replace(/^[-*•]\s*/, '')); // Remove existing bullets

            setInsights(lines);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card className="w-80 max-h-[80vh] flex flex-col shadow-xl border-indigo-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                        <CardTitle className="text-lg font-medium flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Sparkles className="h-5 w-5" />
                            Análisis Inteligente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto">
                        {insights ? (
                            <div className="space-y-3 mt-2">
                                {insights.map((insight, i) => (
                                    <div key={i} className="text-sm text-muted-foreground flex gap-2 items-start">
                                        <span className="text-indigo-500 mt-1">•</span>
                                        <span>{insight}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground mt-2 italic">
                                Toca analizar para que la IA encuentre tendencias y ahorros en tus gastos.
                            </div>
                        )}
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleGenerate}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {loading ? 'Analizando...' : 'Generar Análisis'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                size="icon"
                className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${isOpen
                    ? 'bg-destructive hover:bg-destructive/90 rotate-90'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <span className="text-2xl font-bold text-white">×</span>
                ) : (
                    <Sparkles className="h-6 w-6 text-white" />
                )}
            </Button>
        </div>
    );
}
