
'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/hooks/use-app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Lightbulb, Wifi, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export function StatsCards() {
  const { waterData, electricityData, internetData } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderSkeletons = (count: number) => (
    [...Array(count)].map((_, index) => (
      <Card key={index} className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-10 rounded-full" />
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
    {
      title: 'Total',
      value: formatCurrency(totalServices),
      icon: CircleDollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/30'
    },
    {
      title: 'Agua',
      value: formatCurrency(totalWater),
      icon: Droplet,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-gradient-to-br from-sky-500/20 to-sky-600/10',
      border: 'border-sky-500/30'
    },
    {
      title: 'Electricidad',
      value: formatCurrency(totalElectricity),
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/30'
    },
    {
      title: 'Internet',
      value: formatCurrency(totalInternet),
      icon: Wifi,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-gradient-to-br from-teal-500/20 to-teal-600/10',
      border: 'border-teal-500/30'
    },
  ];

  const StatCard = ({ stat, index }: { stat: typeof stats[0], index: number }) => (
    <Card
      className={`glass-card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slide-up ${stat.border}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        <div className={`p-3 rounded-xl ${stat.bg} transition-transform duration-300 hover:scale-110`}>
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
        <p className="text-xs text-muted-foreground mt-2">Año {currentYear}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}
