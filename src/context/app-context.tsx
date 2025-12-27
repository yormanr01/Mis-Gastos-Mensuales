
'use client';

import React, { createContext, useState, ReactNode, useEffect, useContext, useCallback, useMemo } from 'react';
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
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [waterData, setWaterData] = useState<WaterRecord[]>([]);
  const [electricityData, setElectricityData] = useState<ElectricityRecord[]>([]);
  const [internetData, setInternetData] = useState<InternetRecord[]>([]);
  const [fixedValues, setFixedValuesState] = useState<FixedValues>({ waterDiscount: 0, electricityDiscount: 0, internetDiscount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Cargar caché local al montar
    const waterCache = localStorage.getItem('water_cache');
    const electricityCache = localStorage.getItem('electricity_cache');
    const internetCache = localStorage.getItem('internet_cache');

    if (waterCache) setWaterData(JSON.parse(waterCache));
    if (electricityCache) setElectricityData(JSON.parse(electricityCache));
    if (internetCache) setInternetData(JSON.parse(internetCache));

    // Si hay caché, dejamos de mostrar el estado de carga inicial inmediatamente
    if (waterCache || electricityCache || internetCache) {
      setIsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setWaterData([]);
      setElectricityData([]);
      setInternetData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const waterQuery = collection(db, 'water');
      const waterSnapshot = await getDocs(waterQuery);
      const waterList = waterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WaterRecord)).sort(sortRecords);
      setWaterData(waterList);
      localStorage.setItem('water_cache', JSON.stringify(waterList));

      const electricityQuery = collection(db, 'electricity');
      const electricitySnapshot = await getDocs(electricityQuery);
      const electricityList = electricitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ElectricityRecord)).sort(sortRecords);
      setElectricityData(electricityList);
      localStorage.setItem('electricity_cache', JSON.stringify(electricityList));

      const internetQuery = collection(db, 'internet');
      const internetSnapshot = await getDocs(internetQuery);
      const internetList = internetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InternetRecord)).sort(sortRecords);
      setInternetData(internetList);
      localStorage.setItem('internet_cache', JSON.stringify(internetList));

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  useEffect(() => {
    const storedFixedValues = localStorage.getItem('fixedValues');
    if (storedFixedValues) {
      setFixedValuesState(JSON.parse(storedFixedValues));
    }
  }, []);

  const setFixedValues = useCallback((values: FixedValues) => {
    setFixedValuesState(values);
    localStorage.setItem('fixedValues', JSON.stringify(values));
  }, []);

  const addWaterRecord = useCallback(async (record: Omit<WaterRecord, 'id'>) => {
    const isDuplicate = waterData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de agua para ${record.month} ${record.year}.`);
    }

    const docRef = await addDoc(collection(db, 'water'), record);
    setWaterData(prev => {
      const newData = [...prev, { ...record, id: docRef.id }].sort(sortRecords);
      localStorage.setItem('water_cache', JSON.stringify(newData));
      return newData;
    });
  }, [waterData]);

  const addElectricityRecord = useCallback(async (record: Omit<ElectricityRecord, 'id'>) => {
    const isDuplicate = electricityData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de electricidad para ${record.month} ${record.year}.`);
    }

    const docRef = await addDoc(collection(db, 'electricity'), record);
    setElectricityData(prev => {
      const newData = [...prev, { ...record, id: docRef.id }].sort(sortRecords);
      localStorage.setItem('electricity_cache', JSON.stringify(newData));
      return newData;
    });
  }, [electricityData]);

  const addInternetRecord = useCallback(async (record: Omit<InternetRecord, 'id'>) => {
    const isDuplicate = internetData.some(
      r => r.year === record.year && r.month === record.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe un registro de internet para ${record.month} ${record.year}.`);
    }

    const docRef = await addDoc(collection(db, 'internet'), record);
    setInternetData(prev => {
      const newData = [...prev, { ...record, id: docRef.id }].sort(sortRecords);
      localStorage.setItem('internet_cache', JSON.stringify(newData));
      return newData;
    });
  }, [internetData]);

  const updateWaterRecord = useCallback(async (updatedRecord: WaterRecord) => {
    const isDuplicate = waterData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de agua para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'water', id);
    await updateDoc(docRef, dataToUpdate as any);
    setWaterData(prev => {
      const newData = prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords);
      localStorage.setItem('water_cache', JSON.stringify(newData));
      return newData;
    });
  }, [waterData]);

  const updateElectricityRecord = useCallback(async (updatedRecord: ElectricityRecord) => {
    const isDuplicate = electricityData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de electricidad para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'electricity', id);
    await updateDoc(docRef, dataToUpdate as any);
    setElectricityData(prev => {
      const newData = prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords);
      localStorage.setItem('electricity_cache', JSON.stringify(newData));
      return newData;
    });
  }, [electricityData]);

  const updateInternetRecord = useCallback(async (updatedRecord: InternetRecord) => {
    const isDuplicate = internetData.some(
      r => r.id !== updatedRecord.id && r.year === updatedRecord.year && r.month === updatedRecord.month
    );
    if (isDuplicate) {
      throw new Error(`Ya existe otro registro de internet para ${updatedRecord.month} ${updatedRecord.year}.`);
    }
    const { id, ...dataToUpdate } = updatedRecord;
    const docRef = doc(db, 'internet', id);
    await updateDoc(docRef, dataToUpdate as any);
    setInternetData(prev => {
      const newData = prev.map(r => r.id === id ? updatedRecord : r).sort(sortRecords);
      localStorage.setItem('internet_cache', JSON.stringify(newData));
      return newData;
    });
  }, [internetData]);

  const deleteWaterRecord = useCallback(async (id: string) => {
    const docRef = doc(db, 'water', id);
    await deleteDoc(docRef);
    setWaterData(prev => {
      const newData = prev.filter(r => r.id !== id);
      localStorage.setItem('water_cache', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const deleteElectricityRecord = useCallback(async (id: string) => {
    const docRef = doc(db, 'electricity', id);
    await deleteDoc(docRef);
    setElectricityData(prev => {
      const newData = prev.filter(r => r.id !== id);
      localStorage.setItem('electricity_cache', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const deleteInternetRecord = useCallback(async (id: string) => {
    const docRef = doc(db, 'internet', id);
    await deleteDoc(docRef);
    setInternetData(prev => {
      const newData = prev.filter(r => r.id !== id);
      localStorage.setItem('internet_cache', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const contextValue = useMemo(() => ({
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
    refreshData: fetchData,
    selectedYear,
    setSelectedYear
  }), [
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
    fetchData,
    selectedYear
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
