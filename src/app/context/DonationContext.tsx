import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { donations as initialDonations, type Donation } from '../data/donations';

export type UnifiedDonationStatus = 'متاح' | 'محجوز' | 'تم التسليم' | 'قيد المراجعة' | 'مرفوض';

export interface ExtendedDonation extends Omit<Donation, 'status'> {
  status: UnifiedDonationStatus;
}

interface DonationContextValue {
  donations: ExtendedDonation[];
  addDonation: (donation: ExtendedDonation) => void;
  updateDonationStatus: (id: string, status: UnifiedDonationStatus) => void;
  deleteDonation: (id: string) => void;
  updateDonation: (id: string, updates: Partial<ExtendedDonation>) => void;
}

const DonationContext = createContext<DonationContextValue | null>(null);
const STORAGE_KEY = 'app_donations';

export function DonationProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<ExtendedDonation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Initialize with default
      return initialDonations as unknown as ExtendedDonation[];
    } catch {
      return initialDonations as unknown as ExtendedDonation[];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  }, [donations]);

  const addDonation = (donation: ExtendedDonation) => {
    setDonations(prev => [donation, ...prev]);
  };

  const updateDonationStatus = (id: string, status: UnifiedDonationStatus) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const deleteDonation = (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id));
  };

  const updateDonation = (id: string, updates: Partial<ExtendedDonation>) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  return (
    <DonationContext.Provider value={{ donations, addDonation, updateDonationStatus, deleteDonation, updateDonation }}>
      {children}
    </DonationContext.Provider>
  );
}

export function useDonations() {
  const ctx = useContext(DonationContext);
  if (!ctx) throw new Error('useDonations must be used within DonationProvider');
  return ctx;
}
