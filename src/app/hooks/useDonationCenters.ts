import { useState, useEffect } from 'react';
import { DonationCenter, mockCenters } from '../data/donationCenters';

const STORAGE_KEY = 'donation_centers_db';

export function useDonationCenters() {
  const [centers, setCenters] = useState<DonationCenter[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCenters(JSON.parse(stored));
      } catch {
        setCenters(mockCenters);
      }
    } else {
      setCenters(mockCenters);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCenters));
    }
  }, []);

  const saveCenters = (newCenters: DonationCenter[]) => {
    setCenters(newCenters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCenters));
  };

  const addCenter = (center: DonationCenter) => {
    saveCenters([...centers, center]);
  };

  const updateCenter = (id: string, updated: Partial<DonationCenter>) => {
    saveCenters(centers.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCenter = (id: string) => {
    saveCenters(centers.filter(c => c.id !== id));
  };

  return {
    centers,
    addCenter,
    updateCenter,
    deleteCenter,
    setCenters: saveCenters,
  };
}
