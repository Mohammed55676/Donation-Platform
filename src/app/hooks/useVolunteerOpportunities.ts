import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface VolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  maxVolunteers: number;
  volunteers: number;
  isActive: boolean;
  createdBy: string;
  applicants: string[];
  spotsLeft?: number;
}

export function useVolunteerOpportunities() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    try {
      const res = await api.get('/volunteer');
      setOpportunities(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch volunteer opportunities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const addOpportunity = async (opp: Omit<VolunteerOpportunity, 'id' | 'volunteers' | 'spotsLeft' | 'applicants'>) => {
    try {
      const res = await api.post('/volunteer', opp);
      setOpportunities((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error('Failed to add opportunity', err);
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<VolunteerOpportunity>) => {
    try {
      const res = await api.put(`/volunteer/${id}`, updates);
      setOpportunities((prev) => prev.map((o) => (o.id === id ? res.data.data : o)));
    } catch (err) {
      console.error('Failed to update opportunity', err);
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      await api.delete(`/volunteer/${id}`);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete opportunity', err);
    }
  };

  return { opportunities, loading, addOpportunity, updateOpportunity, deleteOpportunity, fetchOpportunities };
}
