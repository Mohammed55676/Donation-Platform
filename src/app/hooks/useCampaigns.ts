import { useState, useEffect } from 'react';
import api from '../utils/api';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  target: number;
  current: number;
  urgency: 'عالية' | 'متوسطة';
  isActive: boolean;
  progressPercent?: number;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'progressPercent'>) => {
    try {
      const res = await api.post('/campaigns', campaign);
      setCampaigns((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error('Failed to add campaign', err);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const res = await api.put(`/campaigns/${id}`, updates);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
    } catch (err) {
      console.error('Failed to update campaign', err);
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign', err);
    }
  };

  return { campaigns, loading, addCampaign, updateCampaign, deleteCampaign, fetchCampaigns };
}
