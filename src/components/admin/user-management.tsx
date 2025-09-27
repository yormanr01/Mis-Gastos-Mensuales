
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FilePenLine, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import type { User, UserStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type UserManagementProps = {
  onEdit: (user: User) => void;
};

export function UserManagement({ onEdit }: UserManagementProps) {
  const { user, users, fetchUsers, toggleUserStatus } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'Edición') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    try {
      await toggleUserStatus(userId, currentStatus);
      toast({
        title: 'Estado de usuario actualizado',
        description: `El usuario ha sido ${currentStatus === 'Activo' ? 'deshabilitado' : 'habilitado'}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar estado",
        description: error.message,
      });
    }
  }

  const handleExportCSV = () => {
    const headers = ['Correo Electrónico', 'Perfil', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [u.email, u.role, u.status].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'lista_usuarios.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden">
          {users.map((u) => (
            <div key={u.id} className="mb-4 rounded-lg border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{u.email}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                     <Badge variant={u.role === 'Edición' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                     <Badge variant={u.status === 'Activo' ? 'secondary' : 'destructive'}>
                      {u.status}
                    </Badge>
                  </div>
                </div>
                <div className='flex flex-wrap justify-end gap-2'>
                   <Button variant="ghost" size="icon" onClick={() => onEdit(u)} disabled={user?.id === u.id}>
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleToggleStatus(u.id, u.status)}
                    disabled={user?.id === u.id}
                    className={u.status === 'Activo' ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                  >
                    {u.status === 'Activo' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Edición' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'Activo' ? 'secondary' : 'destructive'}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(u)} disabled={user?.id === u.id}>
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      disabled={user?.id === u.id}
                      className={u.status === 'Activo' ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                    >
                      {u.status === 'Activo' ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={handleExportCSV} disabled={users.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </CardFooter>
    </Card>
  );
}
