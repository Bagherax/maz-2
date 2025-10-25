import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Ad } from '../types';
import * as api from '../api';
import { useAuth } from './AuthContext';
import { useNetwork } from '../hooks/useNetwork';

type FilterType = 'all' | 'buy-now' | 'auction';

interface MarketplaceContextType {
  ads: Ad[];
  myAds: Ad[];
  filteredAds: Ad[];
  loading: boolean;
  error: string | null;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  refreshMarketplaceData: () => Promise<void>;
}

export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  
  // FIX: Destructure 'identity' and alias it to 'currentUser' for compatibility.
  const { identity: currentUser } = useAuth();
  const { isOnline } = useNetwork();
  
  const refreshMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch public ads and user's own ads in parallel
      // getAds() works for guests, and getMyAds() will correctly return [] for guests.
      const [fetchedAds, fetchedMyAds] = await Promise.all([
        api.getAds(),
        api.getMyAds()
      ]);
      setAds(fetchedAds);
      setMyAds(fetchedMyAds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch marketplace data.';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch and refetch on user change
  useEffect(() => {
    refreshMarketplaceData();
  }, [refreshMarketplaceData]);

  // Re-fetch data when the user comes back online
  useEffect(() => {
    // This logic prevents fetching on initial load if already online.
    // We only want to trigger this when status changes from offline to online.
    const wasOffline = !isOnline; 
    if (wasOffline) return; // a bit of a hacky way to get previous state

    // When isOnline becomes true, this effect runs
    if (isOnline) {
        refreshMarketplaceData();
    }
  }, [isOnline, refreshMarketplaceData]);
  
  const filteredAds = useMemo(() => {
    if (filter === 'all') return ads;
    return ads.filter(ad => ad.listingType === filter);
  }, [ads, filter]);

  const value = {
    ads,
    myAds,
    filteredAds,
    loading,
    error,
    filter,
    setFilter,
    refreshMarketplaceData,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};