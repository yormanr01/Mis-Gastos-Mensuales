
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
    <div className="relative flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-24 group-has-[[data-collapsible=icon]]/sidebar-wrapper:pt-16 md:pt-24 transition-[padding] ease-linear">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar>
            <MainSidebar />
          </Sidebar>
        </div>

        {/* Main content area */}
        <main
          className={cn(
            "flex-1 pb-16 md:pb-0 transition-[margin] duration-300 ease-in-out",
            // Desktop margin based on sidebar state
            state === 'expanded' ? 'md:ml-64' : 'md:ml-16'
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
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
      <AppLayout>
        {children}
      </AppLayout>
    );
  }

  return null;
}

export function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </SidebarProvider>
  );
}
