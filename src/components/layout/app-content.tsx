

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div className="relative min-h-screen">
      <Sidebar>
        <MainSidebar />
      </Sidebar>
      <main
        className={cn(
          "transition-all duration-200 ease-in-out",
          state === 'expanded' ? 'ml-[16rem]' : 'ml-[3.5rem]'
        )}
      >
        {children}
      </main>
    </div>
  )
}

export function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, user, pathname, router]);

  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Verificando sesión...</p>
        </div>
    );
  }

  if (user) {
    return (
      <SidebarProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </SidebarProvider>
    );
  }

  return null;
}
