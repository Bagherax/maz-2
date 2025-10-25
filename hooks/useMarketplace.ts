import { useContext } from 'react';
import { MarketplaceContext } from '../context/MarketplaceContext';

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
