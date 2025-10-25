import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { VIEWS } from '../../constants/views';
import type { View, CloudConfig, FullUser } from '../../types';
import * as api from '../../api';
import CloudConfigModal from './CloudConfigModal';
import { useNotification } from '../../hooks/useNotification';
import { InfrastructureInfo } from './InfrastructureInfo';
import { AdminPanelIcon } from '../../components/icons/AdminPanelIcon';
import { GuestIcon } from '../../components/icons/GuestIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { CloudIcon } from '../../components/icons/CloudIcon';

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
                className="mt-2 text-sm text-text-secondary hover:underline"
            >
                Or start over as a new guest
            </button>
        </div>
      );
  }

  // After this check, identity is a FullUser.
  const currentUser = identity as FullUser;

  const handleSaveCloudConfig = () => {
    fetchCloudConfig();
    setIsConfigModalOpen(false);
  }

  return (
    <>
      <div className="py-4">
        <div className="flex flex-col items-center">
          <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-24 h-24 rounded-full border-4 border-accent" />
          <h2 className="text-2xl font-bold mt-4 text-text-primary">{currentUser.username}</h2>
          <p className="text-text-secondary">{currentUser.email}</p>
          <div className={`mt-2 px-3 py-1 text-xs font-bold text-white rounded-full ${tierColor[currentUser.tier]}`}>
            {currentUser.tier.toUpperCase()} Member
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button 
              onClick={() => setActiveView(VIEWS.MANAGE_LISTINGS)}
              className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color hover:bg-border-color transition-colors flex items-center justify-between"
          >
              <span className="font-semibold text-text-primary">Manage Your Listings</span>
              <ChevronRightIcon />
          </button>

          {currentUser.tier === 'MAZ' && (
              <button 
                  onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)}
                  className="w-full text-left p-4 bg-indigo-900/50 rounded-lg border border-indigo-700 hover:bg-indigo-900/80 transition-colors flex items-center justify-between"
              >
                  <div className="flex items-center">
                      <AdminPanelIcon />
                      <span className="ml-3 font-semibold text-text-primary">Admin & Compliance</span>
                  </div>
                  <ChevronRightIcon />
              </button>
          )}

          <div className="w-full text-left p-4 bg-secondary rounded-lg border border-border-color">
              <div className="flex items-center justify-between">
                  <div className="flex items-center">
                      <CloudIcon />
                      <span className="ml-3 font-semibold text-text-primary">Your Personal Cloud</span>
                  </div>
                  <button onClick={() => setIsConfigModalOpen(true)} className="text-xs font-semibold bg-accent/80 text-white px-2 py-1 rounded-full hover:bg-accent">
                      {cloudConfig ? 'Reconfigure' : 'Configure'}
                  </button>
              </div>
              <div className="pl-9">
                  <p className="text-sm text-text-secondary mt-2">
                      {cloudConfig ? `Connected to: ${cloudConfig.provider} at ${cloudConfig.serverUrl}` : "Manage your data in your secure, self-hosted storage."}
                  </p>
              </div>
          </div>

          <InfrastructureInfo />

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
            onSave={handleSaveCloudConfig}
            currentConfig={cloudConfig}
          />
      )}
    </>
  );
};

export default Profile;
