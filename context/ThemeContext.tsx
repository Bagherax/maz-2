import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Theme } from '../types';
import * as api from '../api';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setLiveTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  Object.keys(theme).forEach(key => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, theme[key as keyof Theme]);
  });
};

const applyThemeMode = (mode: ThemeMode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
      return (localStorage.getItem('mazdady_theme_mode') as ThemeMode) || 'light';
  });

  const loadTheme = useCallback(async () => {
    const fetchedTheme = await api.getTheme();
    setTheme(fetchedTheme);
    applyTheme(fetchedTheme);
  }, []);

  useEffect(() => {
    loadTheme();
    applyThemeMode(themeMode);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'mazdady_global_theme') {
            console.log("Received 'ThemeUpdateEvent' from P2P network simulation.");
            loadTheme();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadTheme, themeMode]);
  
  const toggleTheme = () => {
      setThemeMode(prevMode => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('mazdady_theme_mode', newMode);
          applyThemeMode(newMode);
          return newMode;
      });
  };

  const setLiveTheme = (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
  }

  const value = {
    theme,
    themeMode,
    setLiveTheme,
    toggleTheme,
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