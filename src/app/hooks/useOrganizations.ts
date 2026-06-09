import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface Organization {
  id: string;
  name: string;
  description: string;
  image?: string;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  raisedFunds: number;
  volunteersCount: number;
  volunteers: any[];
  isActive: boolean;
  createdAt?: string;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async (search = '', location = '') => {
    setLoading(true);
    try {
      const res = await api.get('/organizations', {
        params: { search, location }
      });
      setOrganizations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const addOrganization = async (org: Omit<Organization, 'id' | 'raisedFunds' | 'volunteersCount' | 'volunteers'>) => {
    try {
      const res = await api.post('/organizations', org);
      setOrganizations((prev) => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err) {
      console.error('Failed to add organization', err);
      throw err;
    }
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      const res = await api.put(`/organizations/${id}`, updates);
      setOrganizations((prev) => prev.map((o) => (o.id === id ? res.data.data : o)));
      return res.data.data;
    } catch (err) {
      console.error('Failed to update organization', err);
      throw err;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await api.delete(`/organizations/${id}`);
      setOrganizations((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to delete organization', err);
      throw err;
    }
  };

  const registerAndDonate = async (id: string, paymentData: {
    amount: number;
    cardNumber: string;
    expiry: string;
    cvv: string;
    nameOnCard: string;
    phone: string;
    nationality: string;
    message?: string;
  }) => {
    try {
      const res = await api.post(`/organizations/${id}/register`, paymentData);
      setOrganizations((prev) => prev.map((o) => (o.id === id ? res.data.data : o)));
      return res.data.data;
    } catch (err) {
      console.error('Failed to register and donate to organization', err);
      throw err;
    }
  };

  return {
    organizations,
    loading,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    registerAndDonate,
    fetchOrganizations,
  };
}
