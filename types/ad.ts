import type { User } from './user';

export type AdSyncStatus = 'local' | 'public' | 'synced' | 'takedown';
export type ListingType = 'buy-now' | 'auction';
export type AuctionType = 'english' | 'dutch' | 'sealed';
export type AdCondition = 'new' | 'used' | 'refurbished';

export interface Bid {
  userId: string;
  username: string;
  amount: number;
  timestamp: string;
  signature: string; // Mocked digital signature
}

export interface AuctionDetails {
  startTime: string;
  endTime: string;
  startPrice: number;
  currentPrice?: number; // For Dutch auctions
  bids: Bid[];
}

export interface Ad {
  id: string; // This will be the local/device ID
  publicId?: string; // A UUID generated for network sharing
  title: string;
  description:string;
  price: number;
  seller: User;
  imageUrls: string[]; // Changed from imageUrl to support multiple images
  location: string; // Added for more detailed listings
  rating: number; // Added for user reviews
  reviews: number; // Number of reviews
  condition: AdCondition; // Added to specify item condition
  viewCount?: number; // Added for view statistics
  specs?: { [key: string]: string }; // Added for technical specifications
  createdAt: string;
  listingType: ListingType;
  syncStatus: AdSyncStatus;
  auctionType?: AuctionType;
  auctionDetails?: AuctionDetails;
  version?: number; // For CRDT-like conflict resolution simulation
  boostScore?: number; // For Social Booster feature
  cloudUrl?: string; // Secure, tokenized URL to the ad manifest in the user's cloud
  signature?: string; // User-generated JWT signature for the ad manifest
  isFlagged?: boolean; // True if the ad has been reported by a user
  reportReason?: string; // The reason for the report
  takedownReason?: string; // The reason an admin took the ad down
}