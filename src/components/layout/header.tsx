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
        <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center gap-2 md:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <CircleDollarSign className="w-6 h-6 text-primary" />
                        <h1 className="text-lg font-semibold whitespace-nowrap">Mis Gastos</h1>
                    </Link>
                </div>
                <h1 className="text-lg font-semibold hidden md:block">{currentTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={user?.email || ''} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.email}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.role}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user?.role === 'Edición' && (
                            <>
                                <DropdownMenuItem onClick={() => router.push('/valores-fijos')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Valores Fijos</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Admin Usuarios</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {/* Acerca de - only on mobile */}
                        <DropdownMenuItem onClick={() => router.push('/acerca-de')} className="md:hidden">
                            <Info className="mr-2 h-4 w-4" />
                            <span>Acerca de</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="md:hidden" />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
