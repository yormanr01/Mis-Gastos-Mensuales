
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { useState } from 'react';

const userFormSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }).optional().or(z.literal('')),
  role: z.enum(['Edición', 'Visualización']),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type UserFormProps = {
  setOpen: (open: boolean) => void;
  userToEdit?: User | null;
};

export function UserForm({ setOpen, userToEdit }: UserFormProps) {
  const { addUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: userToEdit ? { ...userToEdit, password: '' } : {
      email: '',
      password: '',
      role: 'Visualización',
    },
  });

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
        if (userToEdit) {
            await updateUser({
                id: userToEdit.id,
                email: values.email,
                role: values.role,
            });
            toast({
                title: 'Usuario actualizado',
                description: 'Los datos del usuario han sido actualizados.',
            });
        } else {
            if (!values.password) {
                form.setError("password", { message: "La contraseña es requerida para nuevos usuarios." });
                setIsSubmitting(false);
                return;
            }
            await addUser({
                email: values.email,
                password: values.password,
                role: values.role,
            });
            toast({
                title: 'Usuario creado',
                description: 'El nuevo usuario ha sido añadido.',
            });
        }
        setOpen(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="usuario@ejemplo.com" {...field} disabled={!!userToEdit} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder={userToEdit ? 'No se puede cambiar' : '******'} {...field} disabled={!!userToEdit}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Edición">Edición</SelectItem>
                  <SelectItem value="Visualización">Visualización</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Form>
  );
}
