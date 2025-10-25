/**
 * MAZ-AI Search Assistant (MASA) Service
 *
 * This service simulates the lightweight, on-device AI for intelligent search autocomplete.
 * It learns from the application's own data (ads, categories, user behavior) to provide
 * relevant, in-context suggestions.
 *
 * ---
 *
 * ### Core Principles (as per spec)
 *
 * 1.  **Lightweight & Fast:** Uses simple but effective algorithms (prefix search, popularity ranking)
 *     for sub-50ms responses. No heavy ML models required for this core feature.
 *
 * 2.  **On-Device Knowledge:** The search index is generated directly from the marketplace's
 *     live ad data, ensuring suggestions are always relevant to what's available.
 *
 * 3.  **Privacy-First:** All processing happens client-side, with no search queries or
 *     keystrokes sent to external servers for suggestions.
 *
 * 4.  **Continuous Learning (Simulated):** The popularity score in the index can be updated
 *     based on user search frequency, making the assistant smarter over time.
 */

import type { Ad } from '../types';

interface SearchIndexEntry {
    text: string;
    popularity: number;
}

/**
 * Generates the search knowledge base from the current list of ads.
 * In a real app, this would be built incrementally and stored locally.
 * Here, we generate it on-the-fly for simulation purposes.
 * @param ads The list of ads from the marketplace.
 * @returns An array of search index entries.
 */
export const generateSearchIndexFromAds = (ads: Ad[]): SearchIndexEntry[] => {
    const indexMap = new Map<string, SearchIndexEntry>();

    ads.forEach(ad => {
        // Use ad title as a primary search term
        const entryText = ad.title.trim();
        if (entryText) {
            const existingEntry = indexMap.get(entryText.toLowerCase());
            // Popularity is a mix of reviews, boost score, and views to simulate relevance
            const popularity = (ad.reviews || 0) + (ad.boostScore || 0) * 5 + (ad.viewCount || 0) / 100;
            if (existingEntry) {
                existingEntry.popularity += popularity;
            } else {
                indexMap.set(entryText.toLowerCase(), {
                    text: entryText,
                    popularity: popularity,
                });
            }
        }
        // Future enhancement: could also add brands, models, etc. from specs here
    });

    return Array.from(indexMap.values());
};


/**
 * Gets a single, top-ranked autocomplete suggestion based on the user's input.
 * Implements a prefix search with popularity ranking.
 * A fuzzy search could be added here later for typo tolerance.
 * @param query The user's current input text.
 * @param searchIndex The knowledge base to search within.
 * @returns The suggested suffix string, or null if no suggestion is found.
 */
export const getAutocompleteSuggestion = (query: string, searchIndex: SearchIndexEntry[]): string | null => {
    if (!query || searchIndex.length === 0) {
        return null;
    }

    const lowerCaseQuery = query.toLowerCase();

    const candidates = searchIndex
        .filter(entry =>
            entry.text.toLowerCase().startsWith(lowerCaseQuery) &&
            entry.text.toLowerCase() !== lowerCaseQuery
        )
        .sort((a, b) => b.popularity - a.popularity);

    if (candidates.length > 0) {
        const bestMatch = candidates[0];
        // Return only the part of the string that comes after the user's query
        return bestMatch.text.substring(query.length);
    }

    return null;
};
