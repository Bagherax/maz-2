import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { VIEWS } from '../../constants/views';
import type { View, CloudConfig } from '../../types';
import * as api from '../../api';
import CloudConfigModal from './CloudConfigModal';
import { useNotification } from '../../hooks/useNotification';
import { InfrastructureInfo } from './InfrastructureInfo';
import { AdminPanelIcon } from '../../components/icons/AdminPanelIcon';
import { GuestIcon } from '../../components/icons/GuestIcon';

interface ProfileProps {
    setActiveView: (view: View) => void;
}

const Profile: React.FC<ProfileProps> = ({ setActiveView }) => {
  const { identity, logout, promptForIdentity } = useAuth();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState<CloudConfig | null>(null);
  const { addNotification } = useNotification();

  const fetchCloudConfig = useCallback(async () => {
    if (identity?.type === 'FULL_USER') {
        const config = await api.getCloudConfig();
        setCloudConfig(config);
    }
  }, [identity]);

  useEffect(() => {
    fetchCloudConfig();
  }, [fetchCloudConfig]);
    
  if (!identity) {
    return (
        <div className="py-4 flex flex-col items-center justify-center text-center h-full">
            <GuestIcon />
            <h2 className="text-2xl font-bold mt-4 text-text-primary">You are a Guest</h2>
            <p className="text-text-secondary mt-2 max-w-xs">
                Create a temporary or permanent identity to post ads, chat with sellers, and manage your data.
            </p>
            <button
                onClick={promptForIdentity}
                className="mt-6 w-full max-w-xs p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
                Get Started
            </button>
        </div>
    );
  }

  const handleDisconnect = async () => {
    try {
        await api.deleteCloudConfig();
        setCloudConfig(null);
        addNotification('Disconnected from personal cloud.', 'info');
    } catch (error) {
        addNotification('Failed to disconnect.', 'error');
    }
  };

  const tierColor: { [key: string]: string } = {
    normal: 'bg-gray-500',
    bronze: 'bg-yellow-700',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-blue-300',
    diamond: 'bg-cyan-400',
    su_diamond: 'bg-purple-500',
    MAZ: 'bg-gradient-to-r from-purple-500 to-indigo-500',
  }
  
  if (identity.type === 'TEMP_USER') {
      return (
        <div className="py-4 flex flex-col items-center justify-center text-center h-full">
            <img src={`https://picsum.photos/seed/${identity.id}/200`} alt={identity.username} className="w-24 h-24 rounded-full border-4 border-accent" />
            <h2 className="text-2xl font-bold mt-4 text-text-primary">{identity.username}</h2>
            <div className="mt-2 px-3 py-1 text-xs font-bold text-white rounded-full bg-gray-500">
              TEMPORARY
            </div>
            <p className="text-text-secondary mt-4 max-w-xs">
                Your data (ads, chats) is stored locally and will be deleted when you close the session.
            </p>
            <button
                onClick={promptForIdentity}
                className="mt-6 w-full max-w-xs p-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
                Sign Up to Save Your Data
            </button>
             <button
                onClick={logout}
                className="mt-4 w-full max-w-xs p-3 bg-red-800/20 text-red-400 rounded-lg border border-red-800/50 hover:bg-red-800/40 transition-colors"
             >
                End Temporary Session
            </button>
        </div>
      )
  }

  return (
    <>
      <div className="py-4">
        <div className="flex flex-col items-center">
          <img src={identity.avatarUrl} alt={identity.username} className="w-24 h-24 rounded-full border-4 border-accent" />
          <h2 className="text-2xl font-bold mt-4 text-text-primary">{identity.username}</h2>
          <p className="text-text-secondary">{identity.email}</p>
          <div className={`mt-2 px-3 py-1 text-xs font-bold text-white rounded-full ${tierColor[identity.tier]}`}>
            {identity.tier.toUpperCase()} Member
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <InfrastructureInfo />

          <button 
              onClick={() => setActiveView(VIEWS.MANAGE_LISTINGS)}
              className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color hover:bg-white/5 transition-colors"
          >
            Manage Listings
          </button>

          {identity.tier === 'MAZ' && (
             <button 
                onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)}
                className="w-full text-left p-4 bg-indigo-900/50 rounded-lg border border-indigo-700 hover:bg-indigo-900/80 transition-colors flex items-center"
            >
                <AdminPanelIcon />
                <span className="ml-3 font-semibold text-text-primary">Admin Panel</span>
            </button>
          )}
          
           <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <ShieldCheckIcon />
                      <span className="ml-3 font-semibold text-text-primary">Social Media Booster</span>
                  </div>
                  <span className="text-xs font-semibold bg-blue-600/50 text-blue-200 px-2 py-1 rounded-full">COMING SOON</span>
              </div>
              <div className="pl-9">
                  <p className="text-sm text-text-secondary mt-2">
                     Promote your ads securely with our Anti-Cheat Browser, powered by behavioral fingerprinting.
                  </p>
              </div>
          </div>

          <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
              <div className="flex items-start justify-between">
                  <div className="flex items-center">
                      <UsersIcon />
                      <div className="ml-3">
                          <span className="font-semibold text-text-primary">Peer-to-Peer Connections</span>
                          <p className="text-sm text-text-secondary mt-1">
                              Enable direct connections (WebRTC) for faster, more private interactions like chat and file sharing.
                          </p>
                      </div>
                  </div>
                  <ToggleSwitch />
              </div>
          </div>

          <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      <span className="ml-3 font-semibold text-text-primary">Your Personal Cloud</span>
                  </div>
                   {cloudConfig ? (
                       <button onClick={handleDisconnect} className="text-sm font-semibold bg-red-800/50 hover:bg-red-800/70 text-red-300 px-3 py-1 rounded-full">
                           Disconnect
                       </button>
                   ) : (
                       <button onClick={() => setIsConfigModalOpen(true)} className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-3 py-1 rounded-full">
                           Configure
                       </button>
                   )}
              </div>
              <div className="pl-9">
                  {cloudConfig ? (
                      <p className="text-sm text-green-400 mt-2 font-semibold">
                          Connected to {cloudConfig.provider.charAt(0).toUpperCase() + cloudConfig.provider.slice(1)}
                      </p>
                  ) : (
                     <p className="text-sm text-text-secondary mt-2">
                        Connect your self-hosted Nextcloud/MinIO storage to own your data.
                    </p>
                  )}
              </div>
          </div>

          <button
            onClick={logout}
            className="w-full p-4 bg-red-800/20 text-red-400 rounded-lg border border-red-800/50 hover:bg-red-800/40 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      {isConfigModalOpen && (
          <CloudConfigModal 
            onClose={() => setIsConfigModalOpen(false)}
            onSave={() => {
                fetchCloudConfig();
                setIsConfigModalOpen(false);
            }}
            currentConfig={cloudConfig}
          />
      )}
    </>
  );
};

export default Profile;