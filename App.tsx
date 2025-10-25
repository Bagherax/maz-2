import React from 'react';
import type { View } from './types';
import { VIEWS } from './constants/views';
import BottomNav from './components/layout/BottomNav';
import Header from './components/layout/Header';
import Marketplace from './features/marketplace/Marketplace';
import Search from './features/search/Search';
import CreateAd from './features/create-ad/CreateAd';
import Chat from './features/chat/Chat';
import Profile from './features/profile/Profile';
import ManageListings from './features/manage-listings/ManageListings';
import { useAuth } from './context/AuthContext';
import NotificationContainer from './components/ui/NotificationContainer';
import AdminDashboard from './features/admin/AdminDashboard';
import ThemeEditor from './features/admin/ThemeEditor';
import LazyAuthModal from './features/auth/LazyAuthModal';
import AdDetailSheet from './features/marketplace/AdDetailSheet';
import MazdadyLogo from './components/ui/MazdadyLogo';

const App: React.FC = () => {
  const [activeView, setActiveView] = React.useState<View>(VIEWS.MARKETPLACE);
  const { identity, loading } = useAuth();

  const renderView = () => {
    switch (activeView) {
      case VIEWS.MARKETPLACE:
        return <Marketplace setActiveView={setActiveView} />;
      case VIEWS.SEARCH:
        return <Search />;
      case VIEWS.CREATE_AD:
        return <CreateAd setActiveView={setActiveView} />;
      case VIEWS.CHAT:
        return <Chat />;
      case VIEWS.PROFILE:
        return <Profile setActiveView={setActiveView} />;
      case VIEWS.MANAGE_LISTINGS:
        // This view requires a full user, handled within the component
        return <ManageListings setActiveView={setActiveView} />;
      case VIEWS.ADMIN_DASHBOARD:
        // This view requires an admin, handled within the component
        return <AdminDashboard setActiveView={setActiveView} />;
      case VIEWS.THEME_EDITOR:
        // This view requires an admin, handled within the component
        return <ThemeEditor setActiveView={setActiveView} />;
      default:
        return <Marketplace setActiveView={setActiveView} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-primary">
        <MazdadyLogo className="text-7xl mb-4 animate-pulse" />
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }
  
  const isSubView = [VIEWS.MANAGE_LISTINGS, VIEWS.ADMIN_DASHBOARD, VIEWS.THEME_EDITOR].includes(activeView);
  const showNav = identity?.type === 'FULL_USER' && !isSubView;

  return (
    <div className="h-screen w-screen flex flex-col bg-primary">
      <NotificationContainer />
      <LazyAuthModal />
      <AdDetailSheet />
      <Header setActiveView={setActiveView} />
      <main className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto pt-16 pb-20 px-4">
        {renderView()}
      </main>
      {showNav && (
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      )}
    </div>
  );
};

export default App;