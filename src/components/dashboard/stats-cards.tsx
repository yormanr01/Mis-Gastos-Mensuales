
'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { useApp } from '@/lib/hooks/use-app';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Lightbulb, Wifi, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export function StatsCards() {
  const { waterData, electricityData, internetData, isLoading, selectedYear } = useApp();

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

  if (isLoading && waterData.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderSkeletons(4)}
      </div>
    );
  }

  const { totalWater, totalElectricity, totalInternet, totalServices } = useMemo(() => {
    const filterBySelectedYear = <T extends { year: number }>(data: T[]) =>
      data.filter((d) => d.year === selectedYear);

    const sumTotal = (data: { totalToPay?: number; monthlyCost?: number }[]) =>
      data.reduce((acc, curr) => acc + (curr.totalToPay ?? curr.monthlyCost ?? 0), 0);

    const water = sumTotal(filterBySelectedYear(waterData));
    const electricity = sumTotal(filterBySelectedYear(electricityData));
    const internet = sumTotal(filterBySelectedYear(internetData));

    return {
      totalWater: water,
      totalElectricity: electricity,
      totalInternet: internet,
      totalServices: water + electricity + internet
    };
  }, [waterData, electricityData, internetData, selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const stats = useMemo(() => [
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
    {
      title: 'Total',
      value: formatCurrency(totalServices),
      icon: CircleDollarSign,
      color: 'text-white',
      bg: 'bg-white/20',
      border: 'border-indigo-400/50',
      isHighlighted: true
    },
  ], [totalWater, totalElectricity, totalInternet, totalServices]);


  const StatCard = memo(({ stat, index, year }: { stat: any, index: number, year: number }) => (
    <Card
      className={`transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${stat.border} ${stat.isHighlighted
        ? 'bg-indigo-600 dark:bg-indigo-700 text-white ring-4 ring-indigo-500/30 shadow-2xl shadow-indigo-500/40 border-transparent'
        : 'glass-card'}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className={`text-sm font-medium ${stat.isHighlighted ? 'text-indigo-100' : 'text-muted-foreground'}`}>{stat.title}</CardTitle>
        <div className={`p-3 rounded-xl ${stat.bg} transition-transform duration-300 hover:scale-110`}>
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`font-bold tracking-tight ${stat.isHighlighted ? 'text-4xl text-white' : 'text-3xl'}`}>{stat.value}</div>
        <p className={`text-xs mt-2 ${stat.isHighlighted ? 'text-indigo-100' : 'text-muted-foreground'}`}>Año {year}</p>
      </CardContent>
    </Card>
  ));

  StatCard.displayName = 'StatCard';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} year={selectedYear} />
      ))}
    </div>
  );
}
