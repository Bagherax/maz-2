import React from 'react';
import { useNetwork } from '../../hooks/useNetwork';
import { WifiStatusIcon } from '../icons/WifiStatusIcon';

const Header: React.FC = () => {
  const { isOnline, toggleNetworkStatus } = useNetwork();

  return (
    <header className="flex-shrink-0 bg-secondary h-16 flex items-center justify-between px-4 border-b border-border-color">
      <h1 className="text-xl font-bold text-text-primary tracking-wider">MAZDADY</h1>
      
      {/* Network Status Simulator */}
      <div className="flex items-center space-x-2" title="Simulate network connection going online/offline">
        <WifiStatusIcon isOnline={isOnline} />
        <span className={`text-xs font-semibold transition-colors ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <button
          onClick={toggleNetworkStatus}
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${
            isOnline ? 'bg-accent' : 'bg-border-color'
          }`}
          role="switch"
          aria-checked={isOnline}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
              isOnline ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;