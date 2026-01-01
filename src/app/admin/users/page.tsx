
'use client';

import { useState } from 'react';

import { UserManagement } from "@/components/admin/user-management";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from '@/components/forms/user-form';
import { UserPlus } from 'lucide-react';
import type { User } from '@/lib/types';

import { PageHeader } from "@/components/page-header";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setFormOpen(true);
  }

  const handleAddNew = () => {
    setUserToEdit(null);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Gestión de Usuarios" icon={Users} />
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-0 md:pt-0">
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-24 md:bottom-8 right-6 z-50 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 h-16 w-16 md:h-12 md:w-auto md:rounded-2xl md:px-8 md:text-lg"
              onClick={handleAddNew}
            >
              <UserPlus className="h-10 w-10 md:mr-3 md:h-6 md:w-6" />
              <span className="hidden md:inline">Añadir Usuario</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{userToEdit ? 'Editar' : 'Nuevo'} Usuario</DialogTitle>
              <DialogDescription>
                {userToEdit ? 'Modifica los' : 'Completa los'} datos del usuario.
              </DialogDescription>
            </DialogHeader>
            <UserForm setOpen={setFormOpen} userToEdit={userToEdit} />
          </DialogContent>
        </Dialog>
        <UserManagement onEdit={handleEdit} />
      </main>
    </div>
  );
}
