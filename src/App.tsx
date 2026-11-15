/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutScreen } from './components/CheckoutScreen';
import { DriverPortal } from './components/DriverPortal';
import { FavoritesScreen } from './components/FavoritesScreen';
import { HomeScreen } from './components/HomeScreen';
import { LocationSheet } from './components/LocationSheet';
import { MerchantPortal } from './components/MerchantPortal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { OrdersScreen } from './components/OrdersScreen';
import { ParcelDeliveryModal } from './components/ParcelDeliveryModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProfileScreen } from './components/ProfileScreen';
import { SearchScreen } from './components/SearchScreen';
import { SplashScreen } from './components/SplashScreen';
import { StoreScreen } from './components/StoreScreen';
import { TopHeader } from './components/TopHeader';
import { AppProvider, useApp } from './context/AppContext';

const QuickGoShell: React.FC = () => {
  const { activePortal, showSplash, activeTab, selectedStoreId, toastMessage } = useApp();

  const renderMainContent = () => {
    if (activePortal === 'driver') return <DriverPortal />;
    if (activePortal === 'merchant') return <MerchantPortal />;
    if (activePortal === 'admin') return <AdminDashboard />;

    if (selectedStoreId) {
      return <StoreScreen />;
    }
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#142B4A] flex flex-col">
      {showSplash && <SplashScreen />}

      {activePortal === 'customer' && !selectedStoreId && <TopHeader />}

      <main className="flex-1">{renderMainContent()}</main>

      {activePortal === 'customer' && !selectedStoreId && <BottomNav />}

      <ProductDetailModal />
      <CartDrawer />
      <CheckoutScreen />
      <ParcelDeliveryModal />
      <LocationSheet />
      <NotificationsDrawer />
      <AuthScreen />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#142B4A] text-white text-xs font-semibold shadow-lg pointer-events-none whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <QuickGoShell />
    </AppProvider>
  );
}
