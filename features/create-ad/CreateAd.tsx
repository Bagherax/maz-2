import React, { useState, useEffect } from 'react';
import type { View, ListingType, AuctionType } from '../../types';
import { createAd, moderateAdContent } from '../../api';
import { generateAdFromImage, generateAuctionSuggestions } from '../../api';
import { VIEWS } from '../../constants/views';
import { AIAnalysisProgress } from './AIAnalysisProgress';
import { useNotification } from '../../hooks/useNotification';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../context/AuthContext';

interface CreateAdProps {
    setActiveView: (view: View) => void;
}

type ViewState = 'upload' | 'analyzing' | 'form';

const CreateAd: React.FC<CreateAdProps> = ({ setActiveView }) => {
  const { identity, promptForIdentity } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('upload');
  const { refreshMarketplaceData } = useMarketplace();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  // Listing/Auction state
  const [listingType, setListingType] = useState<ListingType>('buy-now');
  const [auctionType, setAuctionType] = useState<AuctionType>('english');
  const [duration, setDuration] = useState('24');
  
  // AI & Loading state
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  
  // Redirect to auth prompt if user is a guest trying to create an ad
  useEffect(() => {
    if (!identity) {
      promptForIdentity();
    }
  }, [identity, promptForIdentity]);


  const handleImageChangeAndAnalyze = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!identity) {
        promptForIdentity();
        return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        setViewState('analyzing');

        try {
          const aiResult = await generateAdFromImage(base64Image);
          setTitle(aiResult.title);
          setDescription(aiResult.description);
          setPrice(aiResult.suggestedPrice.toString());
          setIsEnhanced(true);
          setViewState('form');
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'AI analysis failed.';
          setError(errorMessage);
          addNotification(errorMessage, 'error');
          setViewState('upload'); // Revert to upload screen on error
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      promptForIdentity();
      return;
    }

    if (!title || !price || !image) {
      setError('Please fill all fields and upload an image.');
      return;
    }
    setError(null);

    // Step 1: Moderate content
    setModerating(true);
    try {
        const moderationResult = await moderateAdContent({ title, description });
        if (!moderationResult.isSafe) {
            setError(moderationResult.reason || 'Content violates community guidelines.');
            addNotification(moderationResult.reason || 'Content violates guidelines.', 'error');
            setModerating(false);
            return;
        }
    } catch (err) {
        setError('Failed to moderate content. Please try again.');
        setModerating(false);
        return;
    }
    setModerating(false);

    // Step 2: Create Ad
    setLoading(true);
    try {
      const adData: any = { 
          title, 
          description, 
          price: parseFloat(price), 
          image, 
          listingType, 
          version: 1, 
          boostScore: 0,
          location: 'Unknown Location', // Add default location
          rating: 0, // Default rating
          reviews: 0, // Default reviews
      };
      if (listingType === 'auction') {
          adData.auctionType = auctionType;
          adData.auctionDetails = {
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000).toISOString(),
              startPrice: parseFloat(price),
          };
      }
      await createAd(adData);
      const successMessage = identity.type === 'FULL_USER'
        ? 'Ad created as a local draft!'
        : 'Ad created as a temporary draft! Sign up to save it permanently.';
      
      addNotification(successMessage, 'success');

      // Only full users can manage listings
      if(identity.type === 'FULL_USER') {
        await refreshMarketplaceData();
        setActiveView(VIEWS.MANAGE_LISTINGS);
      } else {
        setActiveView(VIEWS.MARKETPLACE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ad.');
    } finally {
      setLoading(false);
    }
  };
  
  const getButtonText = () => {
      if (moderating) return 'Moderating...';
      if (loading) return 'Posting...';
      return 'Create Ad Draft';
  }

  const renderUploadView = () => (
    <div className="mt-6">
        <label htmlFor="file-upload" className="relative cursor-pointer bg-secondary rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center h-64 p-6 hover:border-accent transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="mt-2 block text-lg font-semibold text-text-primary">Start by uploading an image</span>
            <span className="mt-1 block text-sm text-text-secondary">Our AI will automatically generate the ad details for you.</span>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChangeAndAnalyze} accept="image/*" />
        </label>
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
    </div>
  );
  
  const ListingTypeButton: React.FC<{type: ListingType, label: string}> = ({type, label}) => (
      <button
        type="button"
        onClick={() => setListingType(type)}
        className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${listingType === type ? 'bg-accent text-white' : 'bg-secondary hover:bg-border-color'}`}
      >
          {label}
      </button>
  );

  const renderFormView = () => (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="relative">
            {imagePreview && (
                <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-contain rounded-lg transition-all duration-300"
                    style={{ filter: isEnhanced ? 'brightness(1.05) contrast(1.05) saturate(1.1)' : 'none' }}
                />
            )}
            {isEnhanced && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center z-10">
                    <span>AI Enhanced</span>
                </div>
            )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
          <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Listing Type</label>
            <div className="flex space-x-2"><ListingTypeButton type="buy-now" label="Buy Now" /><ListingTypeButton type="auction" label="Auction" /></div>
        </div>

        {listingType === 'auction' && (
             <div className="p-4 bg-primary rounded-lg border border-border-color space-y-4">
                <h4 className="font-semibold text-text-primary">Auction Configuration</h4>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Auction Type</label>
                    <select value={auctionType} onChange={e => setAuctionType(e.target.value as AuctionType)} className="w-full bg-secondary border border-border-color rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm">
                        <option value="english">English (Bids go up)</option>
                        <option value="dutch">Dutch (Price goes down)</option>
                        <option value="sealed">Sealed-Bid (Private bids)</option>
                    </select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-text-secondary">{auctionType === 'dutch' ? 'Starting Price' : 'Starting Bid'}</label>
                  <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" placeholder="0.00" />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-text-secondary">Duration (hours)</label>
                    <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                </div>
            </div>
        )}

        {listingType === 'buy-now' && (
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-secondary">AI Suggested Price</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 block w-full bg-secondary border border-border-color rounded-md shadow-sm py-2 px-3 text-text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" placeholder="0.00" />
            </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading || moderating} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover disabled:bg-gray-500">
          {getButtonText()}
        </button>
    </form>
  );

  const renderContent = () => {
      if (!identity) {
          return (
              <div className="text-center p-8 bg-secondary rounded-lg border border-border-color mt-6">
                <h3 className="text-xl font-bold text-text-primary">Create an Account to Post</h3>
                <p className="text-text-secondary mt-2">You need an identity to create listings on MAZDADY.</p>
                <button onClick={promptForIdentity} className="mt-4 px-6 py-2 bg-accent text-white font-semibold rounded-full">Get Started</button>
              </div>
          )
      }
      switch (viewState) {
          case 'analyzing':
              return <AIAnalysisProgress />;
          case 'form':
              return renderFormView();
          case 'upload':
          default:
              return renderUploadView();
      }
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4 text-text-primary">Create Ad with AI</h2>
      {renderContent()}
    </div>
  );
};

export default CreateAd;