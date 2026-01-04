'use client';

import { useState } from 'react';
import { useApp } from '@/lib/hooks/use-app';
import { generateExpenseInsights } from '@/ai/actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

export function InsightsModal() {
    const { waterData, electricityData, internetData } = useApp();
    const [insights, setInsights] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateExpenseInsights(waterData, electricityData, internetData);
            const lines = result
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => line.replace(/^[-*•]\s*/, ''));

            setInsights(lines);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="fixed bottom-24 md:bottom-6 right-6 z-50 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 h-16 w-16 md:h-12 md:w-auto md:rounded-2xl md:px-6 md:text-lg bg-indigo-600/90 hover:bg-indigo-700/90 text-white border-none backdrop-blur-sm"
                    onClick={() => {
                        if (!insights) handleGenerate();
                    }}
                >
                    <Sparkles className="h-8 w-8 md:h-5 md:w-5 md:mr-2" />
                    <span className="hidden md:inline font-semibold">Análisis Inteligente</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-indigo-500/30">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="h-6 w-6" />
                        Análisis Inteligente
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                            <p className="text-muted-foreground animate-pulse">Analizando tus gastos...</p>
                        </div>
                    ) : insights ? (
                        <div className="space-y-4 max-h-[60vh] overflow-auto pr-2 custom-scrollbar">
                            {insights.map((insight, i) => (
                                <div key={i} className="bg-indigo-500/5 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/10 flex gap-3 items-start transition-all hover:bg-indigo-500/10">
                                    <span className="text-indigo-500 dark:text-indigo-400 font-bold text-lg">•</span>
                                    <span className="text-sm leading-relaxed">{insight}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground italic">No hay datos para analizar aún.</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        {loading ? 'Analizando...' : 'Recalcular análisis'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
