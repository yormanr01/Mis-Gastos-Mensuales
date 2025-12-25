
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Droplet,
  Lightbulb,
  Wifi,
  LayoutDashboard,
  CircleDollarSign,
  History,
  Settings,
  Users,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agua', label: 'Agua', icon: Droplet },
  { href: '/electricidad', label: 'Electricidad', icon: Lightbulb },
  { href: '/internet', label: 'Internet', icon: Wifi },
  { href: '/historial', label: 'Historial', icon: History },
];

const secondaryMenuItems = [
  { href: '/acerca-de', label: 'Acerca de', icon: Info },
];

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();



  const filteredMenuItems = menuItems.filter(item => !item.role || item.role === user?.role);

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <CircleDollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold group-data-[state=collapsed]:hidden">Mis Gastos</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarMenu>
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <SidebarMenu>
          {secondaryMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
