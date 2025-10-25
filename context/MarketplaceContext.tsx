import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Ad } from '../types';
import * as api from '../api';
import { useAuth } from './AuthContext';
import { useNetwork } from '../hooks/useNetwork';

type FilterType = 'all' | 'buy-now' | 'auction';
export type AdSize = 'small' | 'medium' | 'large';
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popularity';


interface MarketplaceContextType {
  ads: Ad[];
  myAds: Ad[];
  filteredAds: Ad[];
  loading: boolean;
  error: string | null;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  adSize: AdSize;
  setAdSize: (size: AdSize) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  refreshMarketplaceData: () => Promise<void>;
}

export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [adSize, setAdSize] = useState<AdSize>('medium');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  const { identity: currentUser } = useAuth();
  const { isOnline } = useNetwork();
  
  const refreshMarketplaceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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

  useEffect(() => {
    refreshMarketplaceData();
  }, [refreshMarketplaceData]);

  useEffect(() => {
    const wasOffline = !isOnline; 
    if (wasOffline) return;

    if (isOnline) {
        refreshMarketplaceData();
    }
  }, [isOnline, refreshMarketplaceData]);
  
  const filteredAds = useMemo(() => {
    let result = ads;
    if (filter !== 'all') {
      result = result.filter(ad => ad.listingType === filter);
    }

    const sortedResult = [...result];
    switch (sortOption) {
      case 'price-asc':
        sortedResult.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedResult.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sortedResult.sort((a, b) => {
          const popA = (a.reviews || 0) + (a.boostScore || 0);
          const popB = (b.reviews || 0) + (b.boostScore || 0);
          return popB - popA;
        });
        break;
      case 'newest':
      default:
        sortedResult.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return sortedResult;
  }, [ads, filter, sortOption]);

  const value = {
    ads,
    myAds,
    filteredAds,
    loading,
    error,
    filter,
    setFilter,
    adSize,
    setAdSize,
    sortOption,
    setSortOption,
    refreshMarketplaceData,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};