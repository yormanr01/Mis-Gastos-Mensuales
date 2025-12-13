
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [isResetFormOpen, setResetFormOpen] = useState(false);


  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white border-2 border-violet-600 rounded-full flex items-center justify-center text-violet-600 font-bold text-2xl">
              $
            </div>
            <h1 className="text-2xl font-semibold">Mis Gastos</h1>
          </div>
          <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <Dialog open={isResetFormOpen} onOpenChange={setResetFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" type="button" className="p-0 h-auto text-sm">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Recuperar Contraseña</DialogTitle>
                    <DialogDescription>
                      Ingresa tu correo electrónico para enviarte un enlace de restablecimiento.
                    </DialogDescription>
                  </DialogHeader>
                  <ResetPasswordForm setOpen={setResetFormOpen} />
                </DialogContent>
              </Dialog>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
