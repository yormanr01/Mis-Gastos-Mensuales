'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Droplet,
    Lightbulb,
    Wifi,
    History,
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agua', label: 'Agua', icon: Droplet },
    { href: '/electricidad', label: 'Electricidad', icon: Lightbulb },
    { href: '/internet', label: 'Internet', icon: Wifi },
    { href: '/historial', label: 'Historial', icon: History },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 active:scale-95 transition-transform duration-75 ${isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
