import React, { useState } from 'react';
import type { Ad, AdSyncStatus } from '../../types';
import { WifiIcon } from '../../components/icons/WifiIcon';
import { CloudIcon } from '../../components/icons/CloudIcon';
import { ArrowUpCircleIcon } from '../../components/icons/ArrowUpCircleIcon';
import { WifiOffIcon } from '../../components/icons/WifiOffIcon';
import { CloudUploadIcon } from '../../components/icons/CloudUploadIcon';
import { CloudOffIcon } from '../../components/icons/CloudOffIcon';
import { ShieldKeyIcon } from '../../components/icons/ShieldKeyIcon';
import { ShareIcon } from '../../components/icons/ShareIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { RocketIcon } from '../../components/icons/RocketIcon';
import EditAdModal from './EditAdModal';
import SocialBoosterModal from './SocialBoosterModal';
import { useNotification } from '../../hooks/useNotification';
import * as api from '../../api';
import { useNetwork } from '../../hooks/useNetwork';

interface MyAdCardProps {
  ad: Ad;
  onActionComplete: () => void;
}

// FIX: Added 'takedown' status to handle ads removed by admins and satisfy the 'AdSyncStatus' type.
const statusConfig: { [key in AdSyncStatus]: { text: string; color: string; icon: React.ReactElement } } = {
    local: { text: 'Local Draft', color: 'bg-gray-500', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    public: { text: 'Live on Network', color: 'bg-blue-500', icon: <WifiIcon /> },
    synced: { text: 'Synced to Cloud', color: 'bg-green-500', icon: <CloudIcon /> },
    takedown: { text: 'Removed by Admin', color: 'bg-red-600', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg> },
};

const ActionButton: React.FC<{
    onClick: () => void;
    loading: boolean;
    disabled?: boolean;
    label: string;
    icon: React.ReactElement;
    className?: string;
    title?: string;
}> = ({ onClick, loading, disabled = false, label, icon, className = 'bg-accent hover:bg-accent-hover text-white', title }) => (
    <button
        onClick={onClick}
        disabled={loading || disabled}
        className={`w-full text-xs font-semibold px-2 py-1.5 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={title}
    >
        {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        ) : (
            <>
                {icon}
                <span className="ml-1.5">{label}</span>
            </>
        )}
    </button>
);


export const MyAdCard: React.FC<MyAdCardProps> = ({ ad, onActionComplete }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBoosterModalOpen, setIsBoosterModalOpen] = useState(false);
    const { addNotification } = useNotification();
    const { isOnline } = useNetwork();
    const status = statusConfig[ad.syncStatus];
    const isSecured = ad.syncStatus === 'public' || ad.syncStatus === 'synced';
    
    const handleAction = async (action: () => Promise<void>, actionName: string) => {
        setLoadingAction(actionName);
        try {
            await action();
            onActionComplete();
        } catch (error) {
            console.error(`Failed to ${actionName}:`, error);
            addNotification(`Error: Could not perform '${actionName}'`, 'error');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleShare = () => {
        const linkToCopy = ad.cloudUrl || `https://mazdady.com/view/${ad.publicId}?token=temporary...`;
        navigator.clipboard.writeText(linkToCopy);
        
        if (ad.syncStatus === 'synced') {
            addNotification('Copied persistent link from your personal cloud.', 'success');
        } else {
            addNotification('Copied temporary link. Active only while you are online.', 'info');
        }
    };

    const networkRequiredTitle = "Action requires an internet connection.";

    const renderActions = () => {
        switch (ad.syncStatus) {
            case 'local':
                return (
                    <div className="space-y-2">
                        <ActionButton
                            onClick={() => handleAction(() => api.publishAd(ad.id), 'publish')}
                            loading={loadingAction === 'publish'}
                            disabled={!isOnline}
                            label="Publish Temporarily"
                            icon={<ArrowUpCircleIcon />}
                            title={!isOnline ? networkRequiredTitle : "Make ad live on the network only while you're online."}
                        />
                         <ActionButton
                            onClick={() => handleAction(() => api.syncAdToCloud(ad.id), 'sync-local')}
                            loading={loadingAction === 'sync-local'}
                            disabled={!isOnline}
                            label="Sync to Cloud"
                            icon={<CloudUploadIcon />}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title={!isOnline ? networkRequiredTitle : "Sync to your cloud to keep the ad always online."}
                        />
                    </div>
                );
            case 'public':
                return (
                    <div className="space-y-2">
                        <ActionButton
                            onClick={() => handleAction(() => api.syncAdToCloud(ad.id), 'sync')}
                            loading={loadingAction === 'sync'}
                            disabled={!isOnline}
                            label="Sync to Cloud"
                            icon={<CloudUploadIcon />}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title={!isOnline ? networkRequiredTitle : "Sync ad to your personal cloud for persistent access."}
                        />
                        <ActionButton
                            onClick={() => handleAction(() => api.unpublishAd(ad.id), 'unpublish')}
                            loading={loadingAction === 'unpublish'}
                             disabled={!isOnline}
                            label="Unpublish"
                            icon={<WifiOffIcon />}
                            className="bg-gray-500 hover:bg-gray-600 text-white"
                            title={!isOnline ? networkRequiredTitle : "Remove ad from the live network, making it a local draft."}
                        />
                    </div>
                );
            case 'synced':
                return (
                     <ActionButton
                        onClick={() => handleAction(() => api.unsyncAdFromCloud(ad.id), 'unsync')}
                        loading={loadingAction === 'unsync'}
                        disabled={!isOnline}
                        label="Un-sync"
                        icon={<CloudOffIcon />}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        title={!isOnline ? networkRequiredTitle : "Remove ad from cloud. It will remain public while you are online."}
                    />
                );
            default:
                return null;
        }
    };

    return (
      <>
        <div className="bg-secondary rounded-lg border border-border-color p-3 flex items-start space-x-3">
            <img src={ad.imageUrls[0]} alt={ad.title} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-text-primary truncate">{ad.title}</h3>
                <p className="text-sm font-bold text-accent mt-1">${ad.price.toFixed(2)}</p>
                 <div className="flex items-center space-x-2 mt-2">
                    <div className={`inline-flex items-center text-xs font-medium text-white px-2 py-1 rounded-full ${status.color}`} title={ad.syncStatus === 'synced' ? "This ad is persistently available via a secure link to your personal cloud." : status.text}>
                        {status.icon}
                        <span className="ml-1.5">{status.text}</span>
                    </div>
                    {isSecured && (
                        <div title={ad.signature ? `Ad data is cryptographically signed to verify your ownership. Signature: ${ad.signature}` : "This ad is cryptographically signed to verify your ownership."} className="inline-flex items-center text-xs font-medium text-cyan-200 bg-cyan-800/50 px-2 py-1 rounded-full">
                            <ShieldKeyIcon />
                            <span className="ml-1.5">Signed</span>
                        </div>
                    )}
                     <div title="Visibility Score from Social Booster" className="inline-flex items-center text-xs font-medium text-yellow-200 bg-yellow-800/50 px-2 py-1 rounded-full">
                        <RocketIcon className="h-3 w-3"/>
                        <span className="ml-1.5 font-bold">{ad.boostScore || 0}</span>
                    </div>
                </div>
            </div>
            <div className="w-32 flex flex-col items-center justify-start space-y-2">
                <ActionButton
                    onClick={() => setIsBoosterModalOpen(true)}
                    loading={loadingAction === 'boost'}
                    disabled={!isOnline}
                    label="Boost Ad"
                    icon={<RocketIcon />}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    title={!isOnline ? networkRequiredTitle : "Boost this ad's visibility by sharing it."}
                />
                <div className="w-full pt-1">{renderActions()}</div>
                <div className="w-full flex space-x-2 pt-1">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="w-full text-xs font-semibold px-2 py-1.5 rounded-full flex items-center justify-center transition-colors bg-secondary border border-border-color hover:bg-border-color text-text-secondary"
                    >
                        <EditIcon />
                    </button>
                    {isSecured && (
                        <button
                            onClick={handleShare}
                            className="w-full text-xs font-semibold px-2 py-1.5 rounded-full flex items-center justify-center transition-colors bg-secondary border border-border-color hover:bg-border-color text-text-secondary"
                        >
                            <ShareIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
        {isEditModalOpen && (
            <EditAdModal
                ad={ad}
                onClose={() => setIsEditModalOpen(false)}
                onSave={onActionComplete}
            />
        )}
        {isBoosterModalOpen && (
            <SocialBoosterModal
                ad={ad}
                onClose={() => setIsBoosterModalOpen(false)}
                onComplete={onActionComplete}
            />
        )}
      </>
    );
};