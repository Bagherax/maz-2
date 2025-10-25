import React, { useMemo } from 'react';
import type { Ad } from '../../types';
import AdCard from '../../components/ui/AdCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMarketplace } from '../../hooks/useMarketplace';

type FilterType = 'all' | 'buy-now' | 'auction';

const Marketplace: React.FC = () => {
  const { filteredAds, loading, error, filter, setFilter } = useMarketplace();

  const FilterButton: React.FC<{ type: FilterType; label: string }> = ({ type, label }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
        filter === type
          ? 'bg-accent text-white'
          : 'bg-secondary text-text-secondary hover:bg-border-color'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">{error}</div>;
  }

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-text-primary">Explore</h2>
        <div className="flex items-center space-x-2">
            <FilterButton type="all" label="All" />
            <FilterButton type="buy-now" label="Buy Now" />
            <FilterButton type="auction" label="Auctions" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filteredAds.map((ad) => (
          <AdCard key={ad.id} ad={ad} size="medium" />
        ))}
      </div>
       {filteredAds.length === 0 && (
        <div className="col-span-2 text-center py-10 text-text-secondary">
          <p>No listings found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;