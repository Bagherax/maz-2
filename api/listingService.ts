import type { User, Ad, AdSyncStatus, ListingType, AuctionType, AuctionDetails } from '../types';
import { MOCK_USERS, NETWORK_STATUS_KEY, simulateDelay, getUserLocalAds, setUserLocalAds } from './mockData';
import { getCurrentUser } from './authService';


/**
 * Gets ads for the public marketplace.
 * Simulates a central discovery server that only knows about ads that
 * users have explicitly made 'public' or 'synced'.
 * It respects the simulated network status of the current user.
 */
export const getAds = async (): Promise<Ad[]> => {
    await simulateDelay(800);
    const currentUser = await getCurrentUser();
    const isCurrentUserOnline = localStorage.getItem(NETWORK_STATUS_KEY) !== 'offline';

    let allDiscoverableAds: Ad[] = [];

    // In this mock, iterate through all known users to build the discovery index
    MOCK_USERS.forEach(user => {
        const userAds = getUserLocalAds(user.id).filter(ad => ad.syncStatus !== 'takedown');
        
        // 1. Synced ads are always discoverable, as they exist on a cloud server
        allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'synced'));

        // 2. Public ads are discoverable only if the user is "online"
        // This simulates the temporary registration in the Discovery Index.
        if (user.id !== currentUser?.id) {
            // For this simulation, we assume all other users are online
            allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'public'));
        } else {
            // For the current user, we respect their actual simulated status
            if (isCurrentUserOnline) {
                allDiscoverableAds.push(...userAds.filter(ad => ad.syncStatus === 'public'));
            }
        }
    });
    
    // Remove duplicates
    const uniqueAds = Array.from(new Map(allDiscoverableAds.map(ad => [ad.publicId || ad.id, ad])).values());
    
    // Sort by boost score first, then by creation date
    return uniqueAds.sort((a, b) => {
        const scoreA = a.boostScore || 0;
        const scoreB = b.boostScore || 0;
        if (scoreA !== scoreB) {
            return scoreB - scoreA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

/**
 * Gets all ads owned by the current user, regardless of status.
 */
export const getMyAds = async (): Promise<Ad[]> => {
    await simulateDelay(400);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }
    return getUserLocalAds(currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

interface CreateAdData {
    title: string;
    description: string;
    price: number;
    image: File;
    listingType: ListingType;
    location: string;
    rating: number;
    reviews: number;
    auctionType?: AuctionType;
    auctionDetails?: Omit<AuctionDetails, 'bids'>;
    version: number;
    boostScore: number;
}

export const createAd = async (data: CreateAdData): Promise<Ad> => {
    await simulateDelay(1000);
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('You must be logged in to create an ad.');
    }

    const newAd: Ad = {
        id: `local-ad-${Date.now()}`,
        publicId: `uuid-ad-${Date.now()}`,
        title: data.title,
        description: data.description,
        price: data.price,
        seller: currentUser,
        imageUrls: [URL.createObjectURL(data.image)], // Store single image in array
        location: data.location,
        rating: data.rating,
        reviews: data.reviews,
        // FIX: Added missing 'condition' property to satisfy the 'Ad' type.
        condition: 'used',
        createdAt: new Date().toISOString(),
        listingType: data.listingType,
        syncStatus: 'local',
        auctionType: data.auctionType,
        auctionDetails: data.auctionDetails ? { ...data.auctionDetails, bids: [] } : undefined,
        version: 1,
        boostScore: 0,
    };
    
    const currentUserAds = getUserLocalAds(currentUser.id);
    currentUserAds.push(newAd);
    setUserLocalAds(currentUser.id, currentUserAds);
    
    return newAd;
};

export const updateAd = async (updatedAd: Ad): Promise<{ad: Ad, conflictResolved: boolean}> => {
    await simulateDelay(600);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === updatedAd.id);

    if (adIndex === -1) throw new Error("Ad not found.");
    
    const currentVersion = userAds[adIndex].version || 1;
    let conflictResolved = false;

    // CRDT Simulation: If the version in storage is higher, a conflict occurred.
    // The simple resolution is to merge by incrementing the latest version number.
    if (currentVersion > (updatedAd.version || 1)) {
        conflictResolved = true;
    }
    
    updatedAd.version = Math.max(currentVersion, updatedAd.version || 1) + 1;
    userAds[adIndex] = updatedAd;

    setUserLocalAds(currentUser.id, userAds);
    return { ad: updatedAd, conflictResolved };
};

// --- AD LIFECYCLE MANAGEMENT FUNCTIONS ---

export const publishAd = async (adId: string): Promise<void> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);

    if (adIndex === -1) throw new Error("Ad not found.");

    userAds[adIndex].syncStatus = 'public';
    setUserLocalAds(currentUser.id, userAds);
};

export const unpublishAd = async (adId: string): Promise<void> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);

    if (adIndex === -1) throw new Error("Ad not found.");

    userAds[adIndex].syncStatus = 'local';
    setUserLocalAds(currentUser.id, userAds);
};

export const syncAdToCloud = async (adId: string): Promise<void> => {
    await simulateDelay(600); // simulate upload + registration
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);
    if (adIndex === -1) throw new Error("Ad not found.");

    const ad = userAds[adIndex];
    console.log(`[Sync Flow] 1. Generating manifest.json for ad: ${ad.publicId}`);
    
    // Simulate manifest upload and getting a secure URL
    const cloudUrl = `https://user-cloud.com/ads/${ad.publicId}.json?token=${Date.now()}`;
    console.log(`[Sync Flow] 2. Uploading manifest to user's personal cloud. URL: ${cloudUrl}`);

    // Simulate signing the URL
    const signature = `JWT.mock.${currentUser.id}.${Date.now()}`;
    console.log(`[Sync Flow] 3. Signing listing URL with user's key. Signature: ${signature}`);

    // Simulate registering with the discovery index
    const registrationPayload = {
        public_id: ad.publicId,
        listing_url: cloudUrl,
        signature: signature,
        ttl_hours: 24
    };
    console.log('[Sync Flow] 4. Registering with MAZDADY discovery index:', registrationPayload);

    // Update the local ad object with new state and data
    ad.syncStatus = 'synced';
    ad.cloudUrl = cloudUrl;
    ad.signature = signature;
    userAds[adIndex] = ad;
    setUserLocalAds(currentUser.id, userAds);
};

export const unsyncAdFromCloud = async (adId: string): Promise<void> => {
    await simulateDelay(300);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);
    if (adIndex === -1) throw new Error("Ad not found.");

    const ad = userAds[adIndex];
    // The ad reverts to being 'public' because the user is still online.
    // The data is no longer guaranteed to be available from the cloud.
    ad.syncStatus = 'public';
    delete ad.cloudUrl; // Remove cloud-specific data
    delete ad.signature;
    console.log(`[Un-Sync Flow] Ad ${ad.publicId} removed from cloud. Now a temporary 'public' listing.`);
    userAds[adIndex] = ad;
    setUserLocalAds(currentUser.id, userAds);
};


export const placeBid = async (adId: string, amount: number): Promise<void> => {
    await simulateDelay(500);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    let adFound = false;
    for (const user of MOCK_USERS) {
        const userAds = getUserLocalAds(user.id);
        const adIndex = userAds.findIndex(ad => ad.id === adId || ad.publicId === adId);
        if (adIndex !== -1) {
            const ad = userAds[adIndex];
            if (ad.auctionDetails) {
                ad.auctionDetails.bids.push({
                    userId: currentUser.id,
                    username: currentUser.username,
                    amount,
                    timestamp: new Date().toISOString(),
                    signature: `signed_by_${currentUser.id}_at_${Date.now()}`
                });
                if (ad.auctionType === 'english') {
                    ad.price = amount;
                }
                setUserLocalAds(user.id, userAds);
                adFound = true;
                break;
            }
        }
    }
    if (!adFound) throw new Error("Auction ad not found.");
};

export const boostAd = async (adId: string): Promise<{ success: boolean; message: string; newScore: number }> => {
    await simulateDelay(3000); // Simulate complex anti-cheat verification
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Authentication required.");

    const userAds = getUserLocalAds(currentUser.id);
    const adIndex = userAds.findIndex(ad => ad.id === adId);
    if (adIndex === -1) throw new Error("Ad not found.");

    // Simulate verification result
    const isGenuine = Math.random() > 0.1; // 90% chance of success

    if (!isGenuine) {
        return { success: false, message: "Automated activity detected. Please try again later.", newScore: userAds[adIndex].boostScore || 0 };
    }

    const boostAmount = 10;
    const currentScore = userAds[adIndex].boostScore || 0;
    const newScore = currentScore + boostAmount;
    userAds[adIndex].boostScore = newScore;
    setUserLocalAds(currentUser.id, userAds);

    return { success: true, message: `Your ad has been boosted by ${boostAmount} points!`, newScore };
};