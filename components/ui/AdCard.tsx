import React from 'react';
import type { Ad } from '../../types';
import { useAdDetail } from '../../context/AdDetailContext';
import { LocationPinIcon } from '../icons/LocationPinIcon';
import { StarIcon } from '../icons/StarIcon';
import { SignatureIcon } from '../icons/SignatureIcon';
import type { ViewMode } from '../../context/MarketplaceContext';

interface AdCardProps {
  ad: Ad;
  viewMode: ViewMode;
}

const AdCard: React.FC<AdCardProps> = ({ ad, viewMode }) => {
  const { openAdDetail } = useAdDetail();

  const handleCardClick = () => {
    openAdDetail(ad.id);
  };

  if (viewMode === 'large') {
    return (
        <button onClick={handleCardClick} className="w-full bg-secondary rounded-lg overflow-hidden shadow-lg border border-border-color group text-left flex flex-col">
            <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />
            <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm text-text-primary">{ad.title}</h3>
                <p className="text-xs text-text-secondary mt-1 flex items-center">
                    <LocationPinIcon />
                    <span className="ml-1">{ad.location}</span>
                </p>
                <p className="text-lg font-bold text-accent mt-2">${ad.price.toFixed(2)}</p>
                <div className="mt-auto pt-2 flex items-center">
                    <img src={ad.seller.avatarUrl} alt={ad.seller.username} className="w-6 h-6 rounded-full" />
                    <span className="ml-2 text-xs text-text-secondary">{ad.seller.username}</span>
                </div>
            </div>
        </button>
    );
  }

  return (
    <button onClick={handleCardClick} className="w-full bg-secondary rounded-lg overflow-hidden shadow-lg border border-border-color group text-left">
      <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity" />
      <div className="p-3">
        <h3 className="font-semibold text-sm text-text-primary truncate">{ad.title}</h3>
        <p className="text-xs text-text-secondary mt-1 flex items-center">
            <LocationPinIcon />
            <span className="ml-1">{ad.location}</span>
        </p>
        <p className="text-base font-bold text-accent mt-2">${ad.price.toFixed(2)}</p>
      </div>
    </button>
  );
};

export default AdCard;