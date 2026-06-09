import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../utils/api';

export type UnifiedDonationStatus = 'متاح' | 'محجوز' | 'تم التسليم' | 'قيد المراجعة' | 'مرفوض';

export interface ExtendedDonation {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  urgency: string;
  image?: string;
  status: UnifiedDonationStatus;
  donor: any;
  claimedBy?: any;
  createdAt: string;
}

interface DonationContextValue {
  donations: ExtendedDonation[];
  loading: boolean;
  fetchDonations: () => Promise<void>;
  addDonation: (donation: Omit<ExtendedDonation, 'id' | 'status' | 'createdAt' | 'donor'>) => Promise<void>;
  updateDonationStatus: (id: string, status: UnifiedDonationStatus) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  updateDonation: (id: string, updates: Partial<ExtendedDonation>) => Promise<void>;
}

const DonationContext = createContext<DonationContextValue | null>(null);

export function DonationProvider({ children }: { children: ReactNode }) {
  const [donations, setDonations] = useState<ExtendedDonation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations');
      setDonations(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch donations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const addDonation = async (donation: Omit<ExtendedDonation, 'id' | 'status' | 'createdAt' | 'donor'>) => {
    try {
      const res = await api.post('/donations', donation);
      setDonations((prev) => [res.data.data, ...prev]);
    } catch (error) {
      console.error('Failed to add donation', error);
    }
  };

  const updateDonationStatus = async (id: string, status: UnifiedDonationStatus) => {
    try {
      const res = await api.put(`/donations/${id}/status`, { status });
      setDonations((prev) => prev.map((d) => (d.id === id ? res.data.data : d)));
    } catch (error) {
      console.error('Failed to update donation status', error);
    }
  };

  const deleteDonation = async (id: string) => {
    try {
      await api.delete(`/donations/${id}`);
      setDonations((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete donation', error);
    }
  };

  const updateDonation = async (id: string, updates: Partial<ExtendedDonation>) => {
    try {
      const res = await api.put(`/donations/${id}`, updates);
      setDonations((prev) => prev.map((d) => (d.id === id ? res.data.data : d)));
    } catch (error) {
      console.error('Failed to update donation', error);
    }
  };

  return (
    <DonationContext.Provider value={{ donations, loading, fetchDonations, addDonation, updateDonationStatus, deleteDonation, updateDonation }}>
      {children}
    </DonationContext.Provider>
  );
}

export function useDonations() {
  const ctx = useContext(DonationContext);
  if (!ctx) throw new Error('useDonations must be used within DonationProvider');
  return ctx;
}
