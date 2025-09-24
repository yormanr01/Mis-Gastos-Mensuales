
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role, UserStatus } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  fetchUsers: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'status'> & { password: string }) => Promise<void>;
  updateUser: (user: Partial<User> & { id: string }) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: UserStatus) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'id'>;
          if (userData.status === 'Activo') {
            const currentUser = { id: firebaseUser.uid, ...userData };
            setUser(currentUser);
            // Si el usuario es editor, carga la lista de usuarios.
            if (currentUser.role === 'Edición') {
              fetchUsers();
            }
          } else {
            await signOut(auth);
            setUser(null);
          }
        } else {
            // User exists in Auth but not in Firestore, log them out.
            await signOut(auth);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    // Verificación adicional para asegurar que solo los editores puedan llamar a esta función.
    if (user?.role !== 'Edición') {
      setUsers([]);
      return;
    }
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('No se encontró el perfil del usuario.');
      }

      const userData = userDoc.data() as Omit<User, 'id'>;

      if (userData.status !== 'Activo') {
        await signOut(auth);
        throw new Error('Esta cuenta de usuario está inactiva.');
      }

      setUser({ id: firebaseUser.uid, ...userData });
      
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Credenciales inválidas. Inténtalo de nuevo.');
      }
      throw error;
    }
  };
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUsers([]);
    router.push('/login');
  };

  const addUser = async (newUser: Omit<User, 'id' | 'status'> & { password: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUser.email,
        role: newUser.role,
        status: 'Activo',
      });
      await fetchUsers();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('El correo electrónico ya está en uso.');
      }
      throw new Error('Error al crear el usuario.');
    }
  };
  
  const updateUser = async (updatedUser: Partial<User> & { id: string }) => {
    const userDocRef = doc(db, 'users', updatedUser.id);
    const dataToUpdate: { role?: Role } = {};
    if (updatedUser.role) dataToUpdate.role = updatedUser.role;
    
    await updateDoc(userDocRef, dataToUpdate);
    await fetchUsers();
  };
  
  const toggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
    if (auth.currentUser?.uid === userId) {
      throw new Error("No puedes cambiar el estado de tu propio usuario.");
    }
    const userDocRef = doc(db, 'users', userId);
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    await updateDoc(userDocRef, { status: newStatus });
    await fetchUsers();
  };

  return (
    <AuthContext.Provider value={{ user, users, isLoading, fetchUsers, login, logout, addUser, updateUser, toggleUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
