
'use client';

import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useApp } from '@/lib/hooks/use-app';
import { months } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnnualChart({ year }: { year: number }) {
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
      .reduce((sum, d) => sum + d.monthlyCost, 0);

    return {
      name: month.substring(0, 3),
      agua: water,
      electricidad: electricity,
      internet: internet,
      total: water + electricity + internet,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos Mensuales - {year}</CardTitle>
        <CardDescription>Un desglose de tus gastos mensuales en servicios.</CardDescription>
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
              cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend
              onClick={(e) => handleLegendClick(e.dataKey)}
              wrapperStyle={{ cursor: 'pointer' }}
            />
            <Line type="monotone" dataKey="agua" name="Agua" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!visibleLines.agua} />
            <Line type="monotone" dataKey="electricidad" name="Luz" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!visibleLines.electricidad} />
            <Line type="monotone" dataKey="internet" name="Internet" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} hide={!visibleLines.internet} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
