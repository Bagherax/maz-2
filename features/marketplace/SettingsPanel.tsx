import React from 'react';
// FIX: Corrected the import path for the 'useMarketplace' hook.
import { useMarketplace } from '../../hooks/useMarketplace';
import { AdSize, SortOption } from '../../context/MarketplaceContext';
import { useTheme } from '../../context/ThemeContext';
import { XMarkIcon } from '../../components/icons/XMarkIcon';
import { SunIcon } from '../../components/icons/SunIcon';
import { MoonIcon } from '../../components/icons/MoonIcon';
import { ViewListIcon } from '../../components/icons/ViewListIcon';
import { ViewGridIcon } from '../../components/icons/ViewGridIcon';
import { ViewGridAddIcon } from '../../components/icons/ViewGridAddIcon';
import { SortAscendingIcon } from '../../components/icons/SortAscendingIcon';
import { UserIcon } from '../../components/icons/UserIcon';
import { FavoriteIcon } from '../../components/icons/FavoriteIcon';
import { RocketIcon } from '../../components/icons/RocketIcon';
import { PlusCircleIcon } from '../../components/icons/PlusCircleIcon';
import type { View } from '../../types';
import { VIEWS } from '../../constants/views';
import { useNotification } from '../../hooks/useNotification';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: View) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, setActiveView }) => {
  const { filter, setFilter, adSize, setAdSize, sortOption, setSortOption } = useMarketplace();
  const { themeMode, toggleTheme } = useTheme();
  const { addNotification } = useNotification();

  const handleNavigate = (view: View) => {
      setActiveView(view);
      onClose();
  }

  const handleComingSoon = (feature: string) => {
    addNotification(`${feature} feature is coming soon!`, 'info');
  }

  const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-b border-border-color pb-4 mb-4">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );

  const FilterButton: React.FC<{ type: 'all' | 'buy-now' | 'auction'; label: string }> = ({ type, label }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors w-full ${
        filter === type ? 'bg-accent text-white' : 'bg-primary text-text-secondary hover:bg-border-color'
      }`}
    >
      {label}
    </button>
  );
  
  const SizeButton: React.FC<{size: AdSize, icon: React.ReactElement}> = ({size, icon}) => (
       <button
          onClick={() => setAdSize(size)}
          className={`p-2 rounded-full transition-colors ${
            adSize === size ? 'bg-accent text-white' : 'bg-primary text-text-secondary hover:bg-border-color'
          }`}
          aria-label={`Set view to ${size}`}
        >
          {icon}
        </button>
  );

  return (
    <>
      <div
        className={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`settings-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="flex items-center justify-between p-4 border-b border-border-color flex-shrink-0">
          <h2 id="settings-title" className="text-lg font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-primary">
            <XMarkIcon />
          </button>
        </header>

        <div className="p-4 overflow-y-auto flex-grow">
          <Section title="Listing Type">
            <div className="flex items-center space-x-2">
              <FilterButton type="all" label="All" />
              <FilterButton type="buy-now" label="Buy Now" />
              <FilterButton type="auction" label="Auction" />
            </div>
          </Section>

          <Section title="Display Size">
            <div className="flex items-center space-x-2 p-1 bg-primary rounded-full">
                <SizeButton size="small" icon={<ViewListIcon />} />
                <SizeButton size="medium" icon={<ViewGridIcon />} />
                <SizeButton size="large" icon={<ViewGridAddIcon />} />
            </div>
          </Section>

          <Section title="Sort By">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                    <SortAscendingIcon />
                </div>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full bg-primary border border-border-color rounded-md py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                >
                    <option value="newest">Newest First</option>
                    <option value="popularity">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>
          </Section>

          <Section title="Appearance">
            <div className="flex items-center justify-between p-2 bg-primary rounded-lg">
                <span className="text-sm font-medium text-text-primary">Theme</span>
                <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 text-text-secondary p-1 rounded-full bg-secondary"
                >
                    <div className={`p-1.5 rounded-full ${themeMode === 'light' ? 'bg-accent text-white' : ''}`}><SunIcon /></div>
                    <div className={`p-1.5 rounded-full ${themeMode === 'dark' ? 'bg-accent text-white' : ''}`}><MoonIcon /></div>
                </button>
            </div>
          </Section>

           <Section title="Promote">
            <div className="space-y-2">
                 <button onClick={() => handleComingSoon('Paid Ad')} className="w-full flex items-center p-2 text-left bg-primary text-text-primary rounded-md border border-transparent hover:border-border-color transition-colors">
                    <PlusCircleIcon />
                    <span className="ml-2 font-medium text-sm">Add Paid Ad</span>
                 </button>
                 <button onClick={() => handleComingSoon('Social Booster')} className="w-full flex items-center p-2 text-left bg-primary text-text-primary rounded-md border border-transparent hover:border-border-color transition-colors">
                    <RocketIcon className="h-6 w-6 text-accent" />
                    <span className="ml-2 font-medium text-sm">Add Social Media Booster Ad</span>
                 </button>
            </div>
           </Section>

           <div className="space-y-2">
             <button onClick={() => handleNavigate(VIEWS.PROFILE)} className="w-full flex items-center p-2 text-left bg-primary text-text-primary rounded-md border border-transparent hover:border-border-color transition-colors">
                <UserIcon />
                <span className="ml-2 font-medium text-sm">User Profile</span>
             </button>
             <button onClick={() => handleComingSoon('Favorites')} className="w-full flex items-center p-2 text-left bg-primary text-text-primary rounded-md border border-transparent hover:border-border-color transition-colors">
                <FavoriteIcon />
                <span className="ml-2 font-medium text-sm">Favorites</span>
             </button>
           </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
