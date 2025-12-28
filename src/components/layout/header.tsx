'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Settings, Users, Info, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/agua': 'Agua',
    '/electricidad': 'Electricidad',
    '/internet': 'Internet',
    '/historial': 'Historial',
    '/valores-fijos': 'Valores Fijos',
    '/admin/users': 'Admin Usuarios',
    '/acerca-de': 'Acerca de',
};

export function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const userInitials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    const currentTitle = pageTitles[pathname] || 'Mis Gastos';

    return (
        <header className="sticky top-0 z-10 flex h-24 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-2 md:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <CircleDollarSign className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-bold whitespace-nowrap">Mis Gastos</h1>
                    </Link>
                </div>
                <h1 className="text-xl font-bold hidden md:block">{currentTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt={user?.email || ''} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal py-3 border-b border-muted">
                            <div className="flex flex-col space-y-1">
                                <p className="text-base font-medium leading-none">{user?.email}</p>
                                <p className="text-sm leading-none text-muted-foreground">
                                    {user?.role}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user?.role === 'Edición' && (
                            <>
                                <DropdownMenuItem onClick={() => router.push('/valores-fijos')} className="py-3 text-base">
                                    <Settings className="mr-3 h-5 w-5" />
                                    <span>Valores Fijos</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/admin/users')} className="py-3 text-base">
                                    <Users className="mr-3 h-5 w-5" />
                                    <span>Admin Usuarios</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {/* Acerca de - only on mobile */}
                        <DropdownMenuItem onClick={() => router.push('/acerca-de')} className="md:hidden py-3 text-base">
                            <Info className="mr-3 h-5 w-5" />
                            <span>Acerca de</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="md:hidden" />
                        <DropdownMenuItem onClick={handleLogout} className="py-3 text-base text-destructive focus:text-destructive">
                            <LogOut className="mr-3 h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
