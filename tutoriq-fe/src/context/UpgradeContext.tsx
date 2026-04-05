import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import revenueCatService from '../services/revenueCatService';
import { SubscriptionTier, FeatureKey } from '../interfaces/interfaces';

const FEATURE_ACCESS: Record<FeatureKey, SubscriptionTier[]> = {
  AI_TUTOR: ['FREE_TRIAL', 'BASIC', 'PREMIUM'],
  CHAT_HISTORY: ['BASIC', 'PREMIUM'],
  SUMMARIZATION: ['BASIC', 'PREMIUM'],
  PROGRESS_DASHBOARD: ['BASIC', 'PREMIUM'],
  PARENT_PORTAL: ['BASIC', 'PREMIUM'],
  ANSWER_TAGGING: ['PREMIUM'],
  FLASHCARDS: ['PREMIUM'],
};

interface UpgradeContextValue {
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  hasFeatureAccess: (feature: FeatureKey) => boolean;
}

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

export function UpgradeProvider({ children }: { children: React.ReactNode }) {
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE_TRIAL');
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tier, fetchedOfferings] = await Promise.all([
        revenueCatService.getSubscriptionStatus(),
        revenueCatService.getOfferings().catch(() => null),
      ]);
      setSubscriptionTier(tier);
      setOfferings(fetchedOfferings);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      const tier = await revenueCatService.getSubscriptionStatus();
      setSubscriptionTier(tier);
    } catch (error) {
      console.error('Failed to refresh subscription status:', error);
    }
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage) => {
    const customerInfo = await revenueCatService.purchasePackage(pkg);
    const active = customerInfo.entitlements.active;
    if (active['premium']?.isActive) {
      setSubscriptionTier('PREMIUM');
    } else if (active['basic']?.isActive) {
      setSubscriptionTier('BASIC');
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    const customerInfo = await revenueCatService.restorePurchases();
    const active = customerInfo.entitlements.active;
    if (active['premium']?.isActive) {
      setSubscriptionTier('PREMIUM');
    } else if (active['basic']?.isActive) {
      setSubscriptionTier('BASIC');
    }
  }, []);

  const hasFeatureAccess = useCallback(
    (feature: FeatureKey): boolean => {
      return FEATURE_ACCESS[feature].includes(subscriptionTier);
    },
    [subscriptionTier]
  );

  return (
    <UpgradeContext.Provider
      value={{
        subscriptionTier,
        isLoading,
        offerings,
        purchasePackage,
        restorePurchases,
        refreshSubscriptionStatus,
        hasFeatureAccess,
      }}
    >
      {children}
    </UpgradeContext.Provider>
  );
}

export function useUpgrade(): UpgradeContextValue {
  const context = useContext(UpgradeContext);
  if (!context) {
    throw new Error('useUpgrade must be used within an UpgradeProvider');
  }
  return context;
}
