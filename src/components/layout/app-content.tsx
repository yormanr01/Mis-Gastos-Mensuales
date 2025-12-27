
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/layout/main-sidebar';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  return (
    <div className="relative min-h-screen">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar>
          <MainSidebar />
        </Sidebar>
      </div>

      {/* Main content area */}
      <main
        className={cn(
          "pb-16 md:pb-0",
          // Desktop margin based on sidebar state
          state === 'expanded' ? 'md:ml-64' : 'md:ml-14'
        )}
      >
        <Header />
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
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
