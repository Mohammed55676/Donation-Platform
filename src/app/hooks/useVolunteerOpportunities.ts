import { useState, useEffect } from 'react';
import { volunteerOpportunities as seedData, type VolunteerOpportunity } from '../data/donations';

const STORAGE_KEY = 'app_volunteer_opportunities';

/**
 * useVolunteerOpportunities — manages the list of volunteer opportunities.
 * Persisted to localStorage so data survives page refresh.
 * Used by both Volunteer.tsx (read) and AdminDashboard.tsx (CRUD).
 */
export function useVolunteerOpportunities() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fall back to seed data
    }
    return seedData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  }, [opportunities]);

  const addOpportunity = (opp: VolunteerOpportunity) => {
    setOpportunities((prev) => [opp, ...prev]);
  };

  const updateOpportunity = (id: string, updates: Partial<VolunteerOpportunity>) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
  };

  return { opportunities, addOpportunity, updateOpportunity, deleteOpportunity };
}
