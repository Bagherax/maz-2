import React, { useState, useEffect, useRef } from 'react';
import { useAdDetail } from '../../context/AdDetailContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { LocationPinIcon } from '../../components/icons/LocationPinIcon';
import { StarIcon } from '../../components/icons/StarIcon';
import { MailIcon } from '../../components/icons/MailIcon';
import { ShareIcon } from '../../components/icons/ShareIcon';
import { VerifiedSealIcon } from '../../components/icons/VerifiedSealIcon';
import { FavoriteIcon } from '../../components/icons/FavoriteIcon';
import { PriceTrackIcon } from '../../components/icons/PriceTrackIcon';

const AdDetailSheet: React.FC = () => {
  const { activeAdId, closeAdDetail } = useAdDetail();
  const { ads, myAds } = useMarketplace();
  const { identity, promptForIdentity } = useAuth();
  const { addNotification } = useNotification();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const allAds = [...ads, ...myAds];
  // Use a Map to ensure unique ads, preferring the one from `myAds` if IDs overlap
  const uniqueAdsMap = new Map(allAds.map(ad => [ad.id, ad]));
  const ad = activeAdId ? uniqueAdsMap.get(activeAdId) : null;
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const isOwnAd = identity?.type === 'FULL_USER' && ad && identity.id === ad.seller.id;
  const isVisible = !!ad;

  // Reset scroll to top whenever a new ad is displayed
  useEffect(() => {
    if (isVisible && contentRef.current) {
      contentRef.current.scrollTop = 0;
      setIsDescriptionExpanded(false);
    }
  }, [activeAdId, isVisible]);


  const handleContactSeller = async () => {
    if (!ad || isOwnAd) return;
    
    if (!identity) {
        promptForIdentity();
        return;
    }

    try {
        await api.startConversationWithSeller(ad.seller);
        addNotification(`Conversation started with ${ad.seller.username}. Check your messages.`, 'success');
    } catch (err) {
        addNotification(err instanceof Error ? err.message : 'Could not start chat.', 'error');
    }
  };
  
  const ActionButton: React.FC<{icon: React.ReactElement, label: string, onClick: () => void}> = ({icon, label, onClick}) => (
      <button onClick={onClick} className="flex flex-col items-center justify-center text-text-secondary hover:text-accent transition-colors">
          {icon}
          <span className="text-xs mt-1">{label}</span>
      </button>
  );

  const Section: React.FC<{title: string, children: React.ReactNode, noBorder?: boolean}> = ({title, children, noBorder = false}) => (
      <div className={`mt-4 ${noBorder ? '' : 'border-t border-border-color pt-4'}`}>
          <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
          {children}
      </div>
  );


  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeAdDetail}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-secondary rounded-t-2xl border-t border-border-color shadow-2xl transition-transform duration-300 ease-in-out flex flex-col md:left-auto md:right-auto md:w-full md:max-w-md md:mx-auto ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '95vh', maxHeight: '95vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-detail-title"
      >
        {ad && (
          <>
            {/* Header Handle */}
            <div className="flex-shrink-0 p-2 border-b border-border-color flex items-center justify-center relative">
               <div className="w-12 h-1.5 bg-border-color rounded-full" />
               <button onClick={closeAdDetail} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10">
                    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Main Scrollable Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">
              {/* Part 1: Instant Attraction */}
              <ImageCarousel images={ad.imageUrls} />
              <div className="p-4">
                  <div className="flex justify-between items-center">
                    <h2 id="ad-detail-title" className="text-2xl font-bold text-text-primary">{ad.title}</h2>
                    <div className="text-xs font-bold text-white px-2 py-1 rounded-full bg-secondary border border-border-color">
                        {ad.condition.charAt(0).toUpperCase() + ad.condition.slice(1)}
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-accent mt-1">${ad.price.toFixed(2)}</p>
              </div>

              {/* Part 2: Building Trust */}
              <div className="px-4 pb-4 border-b border-border-color">
                  <div className="flex justify-between items-center bg-primary p-3 rounded-lg">
                    <div className="flex items-center space-x-1 text-yellow-400">
                        <StarIcon />
                        <span className="font-bold text-sm text-text-primary">{ad.rating.toFixed(1)}</span>
                        <span className="text-xs text-text-secondary">({ad.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                        <LocationPinIcon />
                        <span className="ml-1.5">{ad.location}</span>
                    </div>
                    {ad.syncStatus === 'synced' && (
                        <div className="flex items-center text-sm text-green-400">
                           <VerifiedSealIcon />
                           <span className="ml-1.5 font-semibold">Safe & Verified</span>
                        </div>
                    )}
                  </div>
              </div>

              {/* Part 3: Rational Details */}
              <div className="p-4">
                <Section title="Description" noBorder>
                    <p className={`text-sm text-text-secondary whitespace-pre-wrap ${!isDescriptionExpanded && 'line-clamp-3'}`}>{ad.description}</p>
                    <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-accent text-sm font-semibold mt-1">
                        {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                    </button>
                </Section>
                {ad.specs && (
                    <Section title="Specifications">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                            {Object.entries(ad.specs).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <span className="text-text-secondary">{key}: </span>
                                    <span className="font-semibold text-text-primary">{value}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
              </div>

              {/* Part 5: Transparency & Community */}
               <div className="p-4">
                    <Section title="Community & Stats">
                        <div className="p-3 bg-primary rounded-lg space-y-2">
                            <p className="text-sm text-text-secondary">Viewed <span className="font-bold text-text-primary">{ad.viewCount || 0}</span> times this week.</p>
                            <p className="text-sm text-text-secondary">Community Reviews: <span className="font-bold text-accent">Coming Soon</span></p>
                            <p className="text-xs text-text-secondary/70">Return Policy: Not specified</p>
                        </div>
                    </Section>
                    <Section title="About Seller">
                        <div className="flex items-center">
                            <img src={ad.seller.avatarUrl} alt={ad.seller.username} className="w-12 h-12 rounded-full" />
                            <div className="ml-3">
                                <p className="font-semibold text-text-primary">{ad.seller.username}</p>
                                <p className="text-xs text-text-secondary">{ad.seller.tier.toUpperCase()} Member</p>
                            </div>
                        </div>
                    </Section>
               </div>
            </div>

            {/* Footer Action (Part 4) */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                {!identity && !isOwnAd && (
                    <div className="text-center text-sm bg-yellow-900/80 text-yellow-200 p-2 backdrop-blur-sm">
                        <p>Create an identity to contact the seller.</p>
                    </div>
                )}
                <div className="p-3 bg-secondary/80 border-t border-border-color backdrop-blur-sm flex items-center space-x-2">
                    {identity && identity.type === 'FULL_USER' && (
                        <div className="flex items-center space-x-4 pl-2">
                           <ActionButton icon={<FavoriteIcon />} label="Favorite" onClick={() => addNotification('Favorite feature coming soon!', 'info')} />
                           <ActionButton icon={<PriceTrackIcon />} label="Track" onClick={() => addNotification('Price tracking coming soon!', 'info')} />
                        </div>
                    )}
                    <button
                      onClick={handleContactSeller}
                      disabled={isOwnAd}
                      className="flex-1 flex items-center justify-center p-3 text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-hover disabled:bg-border-color disabled:text-text-secondary disabled:cursor-not-allowed transition-colors"
                    >
                      <MailIcon />
                      <span className="ml-2 font-semibold">{isOwnAd ? "This is your ad" : "Chat with Seller"}</span>
                    </button>
                </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdDetailSheet;