import { useState, useEffect } from 'react';
import { campaigns as initialCampaigns, type Campaign } from '../data/donations';

const STORAGE_KEY = 'app_campaigns';

/**
 * useCampaigns — manages the list of donation campaigns.
 * Campaigns are saved to localStorage so they persist on page refresh.
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // If localStorage is broken, fall back to the default data
    }
    return initialCampaigns;
  });

  // Save to localStorage whenever campaigns change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  // Add a new campaign
  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  // Update an existing campaign by id
  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Remove a campaign by id
  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return { campaigns, addCampaign, updateCampaign, deleteCampaign };
}
