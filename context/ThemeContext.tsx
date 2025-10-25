import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Theme } from '../types';
import * as api from '../api';

interface ThemeContextType {
  theme: Theme;
  setLiveTheme: (theme: Theme) => void;
  loadTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to apply the theme to the document
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.keys(theme).forEach(key => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, theme[key as keyof Theme]);
  });
};


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>({
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    accent: '#4F46E5',
    'accent-hover': '#4338CA',
    'text-primary': '#111827',
    'text-secondary': '#6B7280',
    'border-color': '#E5E7EB',
  });

  const loadTheme = useCallback(async () => {
    const fetchedTheme = await api.getTheme();
    setTheme(fetchedTheme);
    applyTheme(fetchedTheme);
  }, []);

  useEffect(() => {
    // Load theme on initial mount
    loadTheme();

    // Add a storage event listener to simulate the P2P "ThemeUpdateEvent"
    // This allows the theme to update in real-time across all open tabs
    // when an admin publishes a change.
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mazdady_global_theme') {
            console.log("Received 'ThemeUpdateEvent' from P2P network simulation.");
            loadTheme();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup the listener on unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTheme]);

  // This is used for live previews in the editor
  const setLiveTheme = (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
  }

  const value = {
    theme,
    setLiveTheme,
    loadTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};