import type { User, Ad, Conversation, AdminLogEntry, AdCondition } from '../types';
import { MAZDADY_CATEGORIES } from '../constants/categories';

// --- CONSTANTS ---
export const JWT_KEY = 'mazdady_jwt';
export const USER_ADS_PREFIX = 'mazdady_user_ads_';
export const USER_CONVOS_PREFIX = 'mazdady_user_convos_';
export const NETWORK_STATUS_KEY = 'mazdady_network_status';
export const CLOUD_CONFIG_KEY = 'mazdady_cloud_config';
export const ADMIN_LOG_KEY = 'mazdady_admin_log';


// --- MOCK USER DATABASE ---
export const MOCK_USERS: User[] = [
    { id: 'user-1', username: 'mazdady_admin', email: 'admin@mazdady.com', tier: 'MAZ', isVerified: true, avatarUrl: 'https://picsum.photos/seed/admin/200', role: 'super_admin' },
    { id: 'user-2', username: 'seller_pro', email: 'pro@seller.com', tier: 'gold', isVerified: true, avatarUrl: 'https://picsum.photos/seed/pro/200' },
    { id: 'user-3', username: 'casual_seller', email: 'casual@seller.com', tier: 'bronze', isVerified: false, avatarUrl: 'https://picsum.photos/seed/casual/200' },
    { id: 'user-4', username: 'power_user', email: 'power@user.com', tier: 'diamond', isVerified: true, avatarUrl: 'https://picsum.photos/seed/power/200' },
];

const generateMockAds = (): Ad[] => {
    const ads: Ad[] = [];
    const titles = ["Vintage Camera", "Gaming PC", "Mountain Bike", "Designer Handbag", "Electric Guitar", "Antique Vase", "Smartwatch", "Drone with 4K Camera", "Leather Sofa", "Signed Football Jersey"];
    const locations = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"];
    const conditions: AdCondition[] = ['new', 'used', 'refurbished'];
    const descriptions = [
        "In excellent condition, barely used. Comes with all original accessories and packaging.",
        "A powerful machine, perfect for gaming and professional work. Recently upgraded.",
        "Perfect for trails and city riding. Well-maintained and ready to go.",
        "A timeless piece from a famous designer. 100% authentic with proof of purchase.",
        "Classic model with amazing sound. A must-have for any musician.",
        "A beautiful piece of history. Adds elegance to any room.",
        "Latest model with all the features. Includes charger and extra straps.",
        "Capture stunning aerial footage. Easy to fly and very stable.",
        "Comfortable and stylish, made from genuine leather. Great for a living room.",
        "Signed by the legendary player. A true collector's item."
    ];
    const topLevelCategories = Object.keys(MAZDADY_CATEGORIES);

    for (let i = 1; i <= 100; i++) {
        const seller = MOCK_USERS[i % MOCK_USERS.length];
        const title = titles[i % titles.length];
        const topCategoryKey = topLevelCategories[i % topLevelCategories.length];
        
        const subCategoryKeys = Object.keys(MAZDADY_CATEGORIES[topCategoryKey]);
        const subCategoryName = subCategoryKeys.length > 0 ? subCategoryKeys[i % subCategoryKeys.length] : null;

        const ad: Ad = {
            id: `ad-gen-${i}`,
            publicId: `uuid-ad-gen-${i}`,
            version: 1,
            boostScore: Math.floor(Math.random() * 50),
            title: `${title} #${i}`,
            description: descriptions[i % descriptions.length],
            price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
            seller: seller,
            imageUrls: Array.from({ length: 10 }, (_, k) => `https://picsum.photos/seed/${i * 10 + k}/600/400`),
            location: locations[i % locations.length],
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
            reviews: Math.floor(Math.random() * 200),
            condition: conditions[i % conditions.length],
            viewCount: Math.floor(Math.random() * 5000),
            specs: {
                "Brand": "Genericorp",
                "Model": `Model ${i % 10}`,
                "Warranty": "None",
                "Color": "Varies"
            },
            createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
            listingType: Math.random() > 0.3 ? 'buy-now' : 'auction',
            syncStatus: 'public',
            categoryPath: subCategoryName ? [topCategoryKey, subCategoryName] : [topCategoryKey],
        };
        if (ad.listingType === 'auction') {
            ad.auctionType = 'english';
            ad.auctionDetails = {
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
                startPrice: ad.price,
                bids: []
            };
        }
        ads.push(ad);
    }
    return ads;
}


// --- MOCK LOCAL STORAGE / ON-DEVICE DATABASE ---
const getInitialMockAds = (): Ad[] => {
    const generatedAds = generateMockAds();

    // Keep some original specific ads for consistency
    const specialAds: Ad[] = [
        { id: 'ad-2', version: 1, boostScore: 0, publicId: 'uuid-ad-2', title: 'Rare Comic Book (Sealed Auction)', description: 'First edition, mint condition.', price: 500, seller: MOCK_USERS[0], imageUrls: Array.from({ length: 10 }, (_, k) => `https://picsum.photos/seed/comic${k}/600/400`), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), listingType: 'auction', syncStatus: 'synced', auctionType: 'sealed', auctionDetails: { startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000 * 2).toISOString(), startPrice: 500, bids: [] }, cloudUrl: 'https://user-cloud.com/ads/uuid-ad-2.json?token=xyz', signature: 'jwt.mock.signature.user1', location: "Dammam", rating: 4.9, reviews: 45, condition: 'new', viewCount: 12345, categoryPath: ["Hobbies, Sports & Leisure", "Collectibles"] },
        { id: 'ad-flagged-1', version: 1, boostScore: 0, publicId: 'uuid-ad-flagged-1', title: 'Suspiciously Cheap Smart Watch', description: 'Brand new smart watch, latest model, huge discount.', price: 25, seller: MOCK_USERS[1], imageUrls: Array.from({ length: 10 }, (_, k) => `https://picsum.photos/seed/watch${k}/600/400`), createdAt: new Date().toISOString(), listingType: 'buy-now', syncStatus: 'public', isFlagged: true, reportReason: 'Potential Scam / Counterfeit Item', location: "Jeddah", rating: 2.1, reviews: 112, condition: 'new', viewCount: 987, categoryPath: ["Electronics & Technology", "Wearable Technology"] },
    ];

    // Ensure special ads are not duplicated by generated ones
    const generatedIds = new Set(specialAds.map(ad => ad.id));
    const filteredGenerated = generatedAds.filter(ad => !generatedIds.has(ad.id));

    return [...specialAds, ...filteredGenerated];
};

const getInitialAdminLog = (): AdminLogEntry[] => [
    {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        adminId: 'user-1',
        adminUsername: 'mazdady_admin',
        action: 'DISMISSED_REPORT',
        targetId: 'uuid-ad-previous',
        reason: 'False positive flag by user.'
    }
];

export const initializeMockData = () => {
    const allAds = getInitialMockAds();
    
    MOCK_USERS.forEach(user => {
        const userAds = allAds.filter(ad => ad.seller.id === user.id);
        const userAdsKey = `${USER_ADS_PREFIX}${user.id}`;
        // Always overwrite to ensure fresh mock data on reload for testing
        localStorage.setItem(userAdsKey, JSON.stringify(userAds));
    });

    if (!localStorage.getItem(ADMIN_LOG_KEY)) {
      localStorage.setItem(ADMIN_LOG_KEY, JSON.stringify(getInitialAdminLog()));
    }
};

// --- HELPERS ---
export const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getUserLocalData = <T>(prefix: string, userId: string): T[] => {
    const json = localStorage.getItem(`${prefix}${userId}`);
    return json ? JSON.parse(json) : [];
};

export const setUserLocalData = <T>(prefix: string, userId: string, data: T[]) => {
    localStorage.setItem(`${prefix}${userId}`, JSON.stringify(data));
};

export const getUserLocalAds = (userId: string): Ad[] => getUserLocalData<Ad>(USER_ADS_PREFIX, userId);
export const setUserLocalAds = (userId: string, ads: Ad[]) => setUserLocalData<Ad>(USER_ADS_PREFIX, userId, ads);
export const getUserLocalConvos = (userId: string): Conversation[] => getUserLocalData<Conversation>(USER_CONVOS_PREFIX, userId);
export const setUserLocalConvos = (userId: string, convos: Conversation[]) => setUserLocalData<Conversation>(USER_CONVOS_PREFIX, userId, convos);

initializeMockData();