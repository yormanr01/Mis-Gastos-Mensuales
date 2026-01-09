import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { AuthProvider } from '@/context/auth-context';
import { AppContent } from '@/components/layout/app-content';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';



export const metadata: Metadata = {
  title: 'Mis Gastos Mensuales',
  description: 'Aplicación para llevar un registro del consumo de servicios.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <AppContent>
                {children}
              </AppContent>
              <Toaster />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
