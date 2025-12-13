
'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/hooks/use-app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Lightbulb, Wifi, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export function StatsCards() {
  const { waterData, electricityData, internetData } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderSkeletons = (count: number) => (
    [...Array(count)].map((_, index) => (
      <Card key={index}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-1/3 mt-1" />
        </CardContent>
      </Card>
    ))
  );

  if (!isClient) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderSkeletons(4)}
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  const filterByCurrentYear = <T extends { year: number }>(data: T[]) =>
    data.filter((d) => d.year === currentYear);

  const sumTotal = (data: { totalToPay?: number; monthlyCost?: number }[]) =>
    data.reduce((acc, curr) => acc + (curr.totalToPay ?? curr.monthlyCost ?? 0), 0);

  const totalWater = sumTotal(filterByCurrentYear(waterData));
  const totalElectricity = sumTotal(filterByCurrentYear(electricityData));
  const totalInternet = sumTotal(filterByCurrentYear(internetData));
  const totalServices = totalWater + totalElectricity + totalInternet;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const stats = [
    { title: 'Consumo Total', value: formatCurrency(totalServices), icon: CircleDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Agua', value: formatCurrency(totalWater), icon: Droplet, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { title: 'Luz', value: formatCurrency(totalElectricity), icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Internet', value: formatCurrency(totalInternet), icon: Wifi, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];

  const StatCard = ({ stat }: { stat: typeof stats[0] }) => (
    <Card className="transition-all hover:shadow-md border-l-4" style={{ borderLeftColor: 'currentColor' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        <div className={`p-2 rounded-full ${stat.bg}`}>
          <stat.icon className={`h-4 w-4 ${stat.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground mt-1">En el año {currentYear}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  );
}
