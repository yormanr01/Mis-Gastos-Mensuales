
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
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
  LogOut,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agua', label: 'Agua', icon: Droplet },
  { href: '/electricidad', label: 'Electricidad', icon: Lightbulb },
  { href: '/internet', label: 'Internet', icon: Wifi },
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/valores-fijos', label: 'Valores Fijos', icon: Settings, role: 'Edición' },
  { href: '/admin/users', label: 'Admin Usuarios', icon: Users, role: 'Edición' },
];

const secondaryMenuItems = [
    { href: '/acerca-de', label: 'Acerca de', icon: Info },
];

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const filteredMenuItems = menuItems.filter(item => !item.role || item.role === user?.role);

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
            <CircleDollarSign className="w-8 h-8 text-accent" />
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
      <SidebarFooter className="p-4 flex flex-col gap-2">
         <div className="text-xs text-center group-data-[state=collapsed]:hidden">
            <p className="font-semibold">{user?.email}</p>
            <p className="text-muted-foreground">{user?.role}</p>
         </div>
         <SidebarSeparator />
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full">
              <LogOut />
              <span className="group-data-[state=collapsed]:hidden">Cerrar Sesión</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro de que quieres cerrar sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                Serás redirigido a la pantalla de inicio de sesión.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </>
  );
}
