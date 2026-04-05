import { Platform } from 'react-native';
import Purchases, {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import ENV_CONFIG from '../config/environment';
import { SubscriptionTier } from '../interfaces/interfaces';

const BASIC_ENTITLEMENT = 'basic';
const PREMIUM_ENTITLEMENT = 'premium';

export const revenueCatService = {
  async configurePurchases(userId: string): Promise<void> {
    const apiKey =
      Platform.OS === 'ios'
        ? ENV_CONFIG.REVENUECAT_API_KEY_IOS
        : ENV_CONFIG.REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      console.warn('RevenueCat API key not configured for platform:', Platform.OS);
      return;
    }

    try {
      Purchases.configure({ apiKey, appUserID: userId });
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
    }
  },

  async getSubscriptionStatus(): Promise<SubscriptionTier> {
    try {
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      return tierFromEntitlements(customerInfo);
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return 'FREE_TRIAL';
    }
  },

  async purchasePackage(rcPackage: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(rcPackage);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        throw new Error('Purchase was cancelled');
      }
      throw new Error(error.message || 'Purchase failed. Please try again.');
    }
  },

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to restore purchases. Please try again.');
    }
  },

  async getOfferings(): Promise<PurchasesOfferings> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to load subscription options.');
    }
  },
};

function tierFromEntitlements(customerInfo: CustomerInfo): SubscriptionTier {
  if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]?.isActive) {
    return 'PREMIUM';
  }
  if (customerInfo.entitlements.active[BASIC_ENTITLEMENT]?.isActive) {
    return 'BASIC';
  }
  return 'FREE_TRIAL';
}

export default revenueCatService;
