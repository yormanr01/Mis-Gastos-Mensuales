
'use client';

import { useState } from 'react';

import { UserManagement } from "@/components/admin/user-management";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserForm } from '@/components/forms/user-form';
import { UserPlus } from 'lucide-react';
import type { User } from '@/lib/types';

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

      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex justify-end mb-4">
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <UserPlus className="mr-2 h-4 w-4" />
                Añadir Usuario
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
        </div>
        <UserManagement onEdit={handleEdit} />
      </main>
    </div>
  );
}
