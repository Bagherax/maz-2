import React from 'react';
import type { View } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MyAdCard } from './MyAdCard';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { VIEWS } from '../../constants/views';
import { useMarketplace } from '../../hooks/useMarketplace';

interface ManageListingsProps {
    setActiveView: (view: View) => void;
}

const ManageListings: React.FC<ManageListingsProps> = ({ setActiveView }) => {
    const { myAds, loading, error, refreshMarketplaceData } = useMarketplace();

    return (
        <div className="py-4">
            <div className="flex items-center mb-4">
                <button onClick={() => setActiveView(VIEWS.PROFILE)} className="p-2 rounded-full hover:bg-secondary">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-2xl font-bold text-text-primary ml-2">Your Listings</h2>
            </div>

            {loading && <LoadingSpinner />}
            {error && <div className="text-center text-red-500 mt-8">{error}</div>}

            {!loading && !error && (
                <div className="space-y-4">
                    {myAds.length > 0 ? (
                        myAds.map(ad => <MyAdCard key={ad.id} ad={ad} onActionComplete={refreshMarketplaceData} />)
                    ) : (
                        <div className="text-center py-10 text-text-secondary bg-secondary rounded-lg">
                            <p>You haven't created any ads yet.</p>
                            <button 
                                onClick={() => setActiveView(VIEWS.CREATE_AD)} 
                                className="mt-4 px-4 py-2 text-sm font-medium rounded-full bg-accent text-white"
                            >
                                Create Your First Ad
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageListings;