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
import { CogIcon } from '../../components/icons/CogIcon';
import { PencilIcon } from '../../components/icons/PencilIcon';
import { ChatIcon } from '../../components/icons/ChatIcon';
import { LogoutIcon } from '../../components/icons/LogoutIcon';

interface ProfileProps {
    setActiveView: (view: View) => void;
}

const ActionItem: React.FC<{ icon: React.ReactElement; label: string; onClick: () => void; className?: string }> = ({ icon, label, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 bg-primary rounded-lg border border-border-color hover:bg-border-color transition-colors flex items-center justify-between group ${className}`}
    >
        <div className="flex items-center">
            <div className="w-6 h-6 text-accent group-hover:text-accent-hover transition-colors">{icon}</div>
            <span className="ml-4 font-semibold text-text-primary">{label}</span>
        </div>
        <div className="text-text-secondary">
            <ChevronRightIcon />
        </div>
    </button>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="bg-primary p-4 rounded-lg text-center border border-border-color">
        <p className="text-2xl font-bold text-accent">{value}</p>
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">{label}</p>
    </div>
);

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
    normal: 'bg-gray-500 text-white',
    bronze: 'bg-yellow-700 text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-blue-300 text-white',
    diamond: 'bg-cyan-400 text-white',
    su_diamond: 'bg-purple-500 text-white',
    MAZ: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white',
  }
  
  if (identity.type === 'TEMP_USER') {
      return (
        <div className="py-4 flex flex-col items-center justify-center text-center h-full bg-secondary rounded-xl border border-border-color">
            <img src={`https://picsum.photos/seed/${identity.id}/200`} alt={identity.username} className="w-24 h-24 rounded-full border-4 border-accent shadow-lg" />
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
      <div className="py-4 space-y-8">
        {/* Profile Header */}
        <section className="flex items-center space-x-4">
            <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-20 h-20 rounded-full border-4 border-accent shadow-md" />
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-text-primary">{currentUser.username}</h2>
                <p className="text-sm text-text-secondary">{currentUser.email}</p>
                <div className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full ${tierColor[currentUser.tier]}`}>
                    {currentUser.tier.toUpperCase()} Member
                </div>
            </div>
             <button className="p-2 rounded-full text-text-secondary hover:bg-secondary transition-colors" aria-label="Edit Profile">
                <PencilIcon />
            </button>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-4">
            <StatCard value="12" label="Active Ads" />
            <StatCard value="$1.2k" label="Total Sales" />
            <StatCard value="4.8/5" label="Reputation" />
        </section>

        {/* Main Actions */}
        <section className="space-y-3">
             <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-2">Marketplace</h3>
            <div className="bg-secondary p-2 rounded-xl border border-border-color space-y-2">
                <ActionItem label="Manage Your Listings" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>} onClick={() => setActiveView(VIEWS.MANAGE_LISTINGS)} />
                <ActionItem label="Message Center" icon={<ChatIcon />} onClick={() => setActiveView(VIEWS.CHAT)} />
            </div>
        </section>
        
         {/* Data & Admin */}
        <section className="space-y-3">
             <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-2">Data &amp; Admin</h3>
            <div className="bg-secondary p-2 rounded-xl border border-border-color space-y-2">
                 <ActionItem label={cloudConfig ? `Cloud: ${cloudConfig.provider}` : "Connect Personal Cloud"} icon={<CloudIcon />} onClick={() => setIsConfigModalOpen(true)} />
                {currentUser.tier === 'MAZ' && (
                    <ActionItem label="Admin & Compliance" icon={<AdminPanelIcon />} onClick={() => setActiveView(VIEWS.ADMIN_DASHBOARD)} />
                )}
                 <ActionItem label="Account Settings" icon={<CogIcon />} onClick={() => addNotification('Settings page coming soon!', 'info')} />
            </div>
        </section>

        {/* Logout */}
         <section className="pt-4">
            <button
                onClick={logout}
                className="w-full p-3 bg-secondary text-red-500 rounded-lg border border-border-color hover:bg-red-500/10 hover:border-red-500/20 transition-colors flex items-center justify-center font-semibold"
            >
                <LogoutIcon />
                <span className="ml-2">Logout</span>
            </button>
        </section>
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
