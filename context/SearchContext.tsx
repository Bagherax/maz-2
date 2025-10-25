import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import * as api from '../api';

interface SearchContextType {
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  query: string;
  updateQuery: (newQuery: string) => void;
  suggestions: string[];
  rewrittenQuery: string | null;
  finalResult: string | null;
  loading: boolean;
  executeQueryNow: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rewrittenQuery, setRewrittenQuery] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<number | null>(null);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const fetchSuggestions = useCallback(async (currentQuery: string) => {
    if (!currentQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    
    try {
      const fetchedSuggestions = await api.getSearchSuggestions(currentQuery);
      // Ensure we only update suggestions if the query hasn't changed in the meantime
      setQuery(q => {
        if (q === currentQuery) {
          setSuggestions(fetchedSuggestions);
        }
        return q;
      });
    } catch (error) {
      console.error("Search suggestions failed:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setFinalResult(null);
    setRewrittenQuery(null);
    setSuggestions([]); // Immediately clear old suggestions to prevent stale state

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (newQuery.trim()) {
        setLoading(true); // Set loading immediately for better UX feedback
        debounceTimeout.current = window.setTimeout(() => {
            fetchSuggestions(newQuery);
        }, 300);
    } else {
        setLoading(false); // No query, so not loading.
    }
  }, [fetchSuggestions]);

  const executeQueryNow = useCallback(async (currentQuery: string) => {
    if (!currentQuery.trim()) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    setQuery(currentQuery);
    setLoading(true);
    setSuggestions([]);
    setRewrittenQuery(null);
    setFinalResult(null);

    try {
      const improvedQuery = await api.rewriteQuery(currentQuery);
      setRewrittenQuery(improvedQuery);
      
      const answer = await api.askAi(improvedQuery);
      setFinalResult(answer);

    } catch (error) {
      console.error("Full search execution failed:", error);
      setFinalResult("Sorry, an error occurred while searching.");
    } finally {
      setLoading(false);
    }
  }, []);


  const value = {
    isPanelOpen,
    openPanel,
    closePanel,
    query,
    updateQuery,
    suggestions,
    rewrittenQuery,
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