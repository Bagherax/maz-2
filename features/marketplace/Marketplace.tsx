import React, { useState } from 'react';
import AdCard from '../../components/ui/AdCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMarketplace } from '../../hooks/useMarketplace';
import SettingsPanel from './SettingsPanel';
import { SettingsIcon } from '../../components/icons/SettingsIcon';
import type { View } from '../../types';

interface MarketplaceProps {
  setActiveView: (view: View) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ setActiveView }) => {
  const { filteredAds, loading, error, viewMode } = useMarketplace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }
  
  const gridClasses = {
    grid: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4',
    large: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  };

  return (
    <div className="py-4">
      <div className="h-8 flex justify-end items-center mb-4">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full text-text-secondary hover:bg-secondary hover:text-text-primary transition-colors"
          aria-label="Open settings panel"
        >
          <SettingsIcon />
        </button>
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        setActiveView={setActiveView} 
      />

      <div className={`grid ${gridClasses[viewMode]}`}>
        {filteredAds.map((ad) => (
          <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
        ))}
      </div>
       {filteredAds.length === 0 && (
        <div className="col-span-full text-center py-10 text-text-secondary">
          <p>No listings found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;