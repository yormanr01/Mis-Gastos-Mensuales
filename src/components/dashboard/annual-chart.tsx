'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '@/lib/hooks/use-app';
import { months } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnnualChart() {
  const { waterData, electricityData, internetData } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  
  const currentYear = new Date().getFullYear();

  const chartData = months.map((month) => {
    const water = waterData
      .filter((d) => d.year === currentYear && d.month === month)
      .reduce((sum, d) => sum + d.totalToPay, 0);
    const electricity = electricityData
      .filter((d) => d.year === currentYear && d.month === month)
      .reduce((sum, d) => sum + d.totalToPay, 0);
    const internet = internetData
      .filter((d) => d.year === currentYear && d.month === month)
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
        <CardTitle>Gastos Mensuales - {currentYear}</CardTitle>
        <CardDescription>Un desglose de tus gastos mensuales en servicios.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                }}
            />
            <Bar dataKey="agua" fill="hsl(var(--chart-1))" stackId="a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="electricidad" fill="hsl(var(--chart-4))" stackId="a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="internet" fill="hsl(var(--chart-2))" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
