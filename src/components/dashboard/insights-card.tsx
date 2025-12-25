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
        <Card className="glass-card border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="h-5 w-5" />
                    Análisis Inteligente
                </CardTitle>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 relative overflow-hidden group"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <span className="relative z-10">Analizar</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                {insights ? (
                    <div className="space-y-3 mt-2">
                        {insights.map((insight, i) => (
                            <div key={i} className="text-sm text-muted-foreground flex gap-2 items-start animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="text-indigo-500 dark:text-indigo-400 mt-1 font-bold">•</span>
                                <span>{insight}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground mt-2 italic">
                        Toca "Analizar" para que la IA encuentre tendencias y ahorros en tus gastos.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
