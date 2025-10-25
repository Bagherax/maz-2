import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import * as api from '../api';
import { useMarketplace } from '../hooks/useMarketplace';

interface SearchIndexEntry {
    text: string;
    popularity: number;
}

interface SearchContextType {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  query: string;
  updateQuery: (newQuery: string) => void;
  suggestion: string | null;
  acceptSuggestion: () => void;
  suggestions: string[];
  finalResult: string | null;
  loading: boolean;
  executeQueryNow: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { ads } = useMarketplace();
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>([]);

  // Generate the search knowledge base when ads are loaded
  useEffect(() => {
    if (ads.length > 0) {
        const index = api.generateSearchIndexFromAds(ads);
        setSearchIndex(index);
    }
  }, [ads]);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setFinalResult(null);

    if (newQuery.trim()) {
        const newSuggestion = api.getAutocompleteSuggestion(newQuery, searchIndex);
        setSuggestion(newSuggestion);
    } else {
        setSuggestion(null);
    }
  }, [searchIndex]);

  const acceptSuggestion = useCallback(() => {
    if (suggestion) {
        // Use a functional update to ensure we're using the latest state
        setQuery(prevQuery => prevQuery + suggestion);
        setSuggestion(null);
    }
  }, [suggestion]);

  const executeQueryNow = useCallback(async (currentQuery: string) => {
    if (!currentQuery.trim()) return;
    
    setQuery(currentQuery);
    setSuggestion(null); // Clear suggestion on execution
    setLoading(true);
    setSuggestions([]);
    setFinalResult(null);

    try {
      const answer = await api.answerQueryAboutMarketplace(currentQuery, ads);
      setFinalResult(answer);
    } catch (error) {
      console.error("Full search execution failed:", error);
      setFinalResult("Sorry, an error occurred while searching.");
    } finally {
      setLoading(false);
    }
  }, [ads]);


  const value = {
    isPanelOpen,
    openPanel,
    closePanel,
    query,
    updateQuery,
    suggestion,
    acceptSuggestion,
    suggestions,
    finalResult,
    loading,
    executeQueryNow
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};