import React from 'react';
import type { Ad } from '../../types';
import { useAdDetail } from '../../context/AdDetailContext';
import { LocationPinIcon } from '../icons/LocationPinIcon';
import { StarIcon } from '../icons/StarIcon';
import { SignatureIcon } from '../icons/SignatureIcon';

interface AdCardProps {
  ad: Ad;
  size?: 'small' | 'medium' | 'large';
}

const AdCard: React.FC<AdCardProps> = ({ ad, size = 'medium' }) => {
  const { openAdDetail } = useAdDetail();

  const handleCardClick = () => {
    openAdDetail(ad.id);
  };

  const renderSmall = () => (
    <button onClick={handleCardClick} className="w-full flex items-center p-2 bg-secondary rounded-lg border border-border-color hover:bg-border-color transition-colors">
      <img src={ad.imageUrls[0]} alt={ad.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
      <h3 className="font-semibold text-sm text-text-primary truncate ml-3 text-left">{ad.title}</h3>
    </button>
  );

  const renderMedium = () => (
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

  const renderLarge = () => (
    <button onClick={handleCardClick} className="w-full bg-secondary rounded-lg overflow-hidden shadow-lg border-2 border-border-color hover:border-accent transition-colors group text-left col-span-2">
       <img src={ad.imageUrls[0]} alt={ad.title} className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" />
       <div className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-text-primary">{ad.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 flex items-center">
                        <LocationPinIcon />
                        <span className="ml-1.5">{ad.location}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                    <StarIcon />
                    <span className="font-bold text-sm">{ad.rating.toFixed(1)}</span>
                    <span className="text-xs text-text-secondary">({ad.reviews})</span>
                </div>
            </div>
             <p className="text-sm text-text-secondary mt-2 line-clamp-2">{ad.description}</p>
            <p className="text-xl font-bold text-accent mt-3">${ad.price.toFixed(2)}</p>
       </div>
    </button>
  );

  switch (size) {
    case 'small':
      return renderSmall();
    case 'large':
      return renderLarge();
    case 'medium':
    default:
      return renderMedium();
  }
};

export default AdCard;