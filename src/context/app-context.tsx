
'use client';

import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import type { WaterRecord, ElectricityRecord, InternetRecord, FixedValues } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query } from 'firebase/firestore';
import { AuthContext } from './auth-context';
import { sortRecords } from '@/lib/data';

interface AppContextType {
  waterData: WaterRecord[];
  electricityData: ElectricityRecord[];
  internetData: InternetRecord[];
  fixedValues: FixedValues;
  setFixedValues: (values: FixedValues) => void;
  addWaterRecord: (record: Omit<WaterRecord, 'id'>) => Promise<void>;
  addElectricityRecord: (record: Omit<ElectricityRecord, 'id'>) => Promise<void>;
  addInternetRecord: (record: Omit<InternetRecord, 'id'>) => Promise<void>;
  updateWaterRecord: (record: WaterRecord) => Promise<void>;
  updateElectricityRecord: (record: ElectricityRecord) => Promise<void>;
  updateInternetRecord: (record: InternetRecord) => Promise<void>;
  deleteWaterRecord: (id: string) => Promise<void>;
  deleteElectricityRecord: (id: string) => Promise<void>;
  deleteInternetRecord: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [waterData, setWaterData] = useState<WaterRecord[]>([]);
  const [electricityData, setElectricityData] = useState<ElectricityRecord[]>([]);
  const [internetData, setInternetData] = useState<InternetRecord[]>([]);
  const [fixedValues, setFixedValuesState] = useState<FixedValues>({ waterDiscount: 0, internetMonthlyCost: 40 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setWaterData([]);
      setElectricityData([]);
      setInternetData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const waterQuery = query(collection(db, 'water'));
      const waterSnapshot = await getDocs(waterQuery);
      const waterList = waterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterRecord)).sort(sortRecords);
      setWaterData(waterList);

      const electricityQuery = query(collection(db, 'electricity'));
      const electricitySnapshot = await getDocs(electricityQuery);
      const electricityList = electricitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ElectricityRecord)).sort(sortRecords);
      setElectricityData(electricityList);

      const internetQuery = query(collection(db, 'internet'));
      const internetSnapshot = await getDocs(internetQuery);
      const internetList = internetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternetRecord)).sort(sortRecords);
      setInternetData(internetList);

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);
  
    useEffect(() => {
    const storedFixedValues = localStorage.getItem('fixedValues');
    setFixedValuesState(storedFixedValues ? JSON.parse(storedFixedValues) : { waterDiscount: 0, internetMonthlyCost: 40 });
  }, []);

  const setFixedValues = (values: FixedValues) => {
    setFixedValuesState(values);
    localStorage.setItem('fixedValues', JSON.stringify(values));
  };

  const addWaterRecord = async (record: Omit<WaterRecord, 'id'>) => {
    const isDuplicate = waterData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de agua para ${record.month} ${record.year}.`);
    }

    const docRef = await addDoc(collection(db, 'water'), record);
    setWaterData(prev => [...prev, { ...record, id: docRef.id }].sort(sortRecords));
  };

  const addElectricityRecord = async (record: Omit<ElectricityRecord, 'id'>) => {
    const isDuplicate = electricityData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de electricidad para ${record.month} ${record.year}.`);
    }
    
    const docRef = await addDoc(collection(db, 'electricity'), record);
    setElectricityData(prev => [...prev, { ...record, id: docRef.id }].sort(sortRecords));
  };

  const addInternetRecord = async (record: Omit<InternetRecord, 'id'>) => {
    const isDuplicate = internetData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de internet para ${record.month} ${record.year}.`);
    }

    const docRef = await addDoc(collection(db, 'internet'), record);
    setInternetData(prev => [...prev, { ...record, id: docRef.id }].sort(sortRecords));
  };

  const updateWaterRecord = async (updatedRecord: WaterRecord) => {
    const isDuplicate = waterData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de agua para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'water', id);
    await updateDoc(docRef, dataToUpdate as any);
    setWaterData(prev => prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords));
  };

  const updateElectricityRecord = async (updatedRecord: ElectricityRecord) => {
     const isDuplicate = electricityData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de electricidad para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'electricity', id);
    await updateDoc(docRef, dataToUpdate as any);
    setElectricityData(prev => prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords));
  };

  const updateInternetRecord = async (updatedRecord: InternetRecord) => {
    const isDuplicate = internetData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de internet para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'internet', id);
    await updateDoc(docRef, dataToUpdate as any);
    setInternetData(prev => prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords));
  };

  const deleteWaterRecord = async (id: string) => {
    const docRef = doc(db, 'water', id);
    await deleteDoc(docRef);
    setWaterData(prev => prev.filter(r => r.id !== id));
  };

  const deleteElectricityRecord = async (id: string) => {
    const docRef = doc(db, 'electricity', id);
    await deleteDoc(docRef);
    setElectricityData(prev => prev.filter(r => r.id !== id));
  };

  const deleteInternetRecord = async (id: string) => {
    const docRef = doc(db, 'internet', id);
    await deleteDoc(docRef);
    setInternetData(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      waterData, 
      electricityData, 
      internetData,
      fixedValues,
      setFixedValues,
      addWaterRecord,
      addElectricityRecord,
      addInternetRecord,
      updateWaterRecord,
      updateElectricityRecord,
      updateInternetRecord,
      deleteWaterRecord,
      deleteElectricityRecord,
      deleteInternetRecord,
      isLoading,
      refreshData: fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};
