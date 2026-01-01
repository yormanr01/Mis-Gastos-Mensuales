
'use client';

import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApp } from '@/lib/hooks/use-app';
import { months } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnnualChart({
  year,
  selectedYear,
  onYearChange,
  availableYears
}: {
  year: number;
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}) {
  const { waterData, electricityData, internetData } = useApp();
  const [isClient, setIsClient] = useState(false);
  const [visibleLines, setVisibleLines] = useState({
    agua: true,
    electricidad: true,
    internet: true,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLegendClick = (dataKey: any) => {
    if (!dataKey || typeof dataKey !== 'string') return;
    setVisibleLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey as keyof typeof prev]
    }));
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 pt-4">
        {payload.map((entry: any, index: number) => {
          const isVisible = visibleLines[entry.dataKey as keyof typeof visibleLines];
          return (
            <div
              key={`legend-${index}`}
              onClick={() => handleLegendClick(entry.dataKey)}
              className="flex items-center gap-2 cursor-pointer select-none transition-opacity hover:opacity-100"
              style={{ opacity: isVisible ? 1 : 0.4 }}
            >
              <div
                className="w-8 h-0.5 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = months.map((month) => {
    const water = waterData
      .filter((d) => d.year === year && d.month === month)
      .reduce((sum, d) => sum + d.totalToPay, 0);
    const electricity = electricityData
      .filter((d) => d.year === year && d.month === month)
      .reduce((sum, d) => sum + d.totalToPay, 0);
    const internet = internetData
      .filter((d) => d.year === year && d.month === month)
      .reduce((sum, d) => sum + d.totalToPay, 0);

    return {
      name: month.substring(0, 3),
      agua: water,
      electricidad: electricity,
      internet: internet,
      total: water + electricity + internet,
    };
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Gastos Mensuales</CardTitle>
            <CardDescription>Un desglose de tus gastos mensuales en servicios.</CardDescription>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="h-10 px-4 rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 2 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
                backdropFilter: 'blur(12px)',
              }}
            />
            <Legend content={renderLegend} />
            <Line
              type="monotone"
              dataKey="agua"
              name="Agua"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              hide={!visibleLines.agua}
            />
            <Line
              type="monotone"
              dataKey="electricidad"
              name="Electricidad"
              stroke="hsl(var(--chart-4))"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              hide={!visibleLines.electricidad}
            />
            <Line
              type="monotone"
              dataKey="internet"
              name="Internet"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              hide={!visibleLines.internet}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
