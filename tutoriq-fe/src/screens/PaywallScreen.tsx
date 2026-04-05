import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { useUpgrade } from '../context/UpgradeContext';
import { theme } from '../theme';

const BASIC_FEATURES = [
  'AI Tutoring (500 exchanges/mo)',
  'Chat History',
  'Summarization',
  'Progress Dashboard',
  'Parent Portal',
];

const PREMIUM_FEATURES = [
  'AI Tutoring (1,000 exchanges/mo)',
  'All Basic features',
  'Answer Tagging',
  'Flashcard Creation',
  'Flashcard Matching Game',
];

interface PaywallScreenProps {
  navigation?: { goBack: () => void };
}

export default function PaywallScreen({ navigation }: PaywallScreenProps) {
  const { offerings, purchasePackage, restorePurchases, isLoading: contextLoading } = useUpgrade();
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages = offerings?.current?.availablePackages ?? [];
  const basicPkg = packages.find((p) => p.identifier.toLowerCase().includes('basic'));
  const premiumPkg = packages.find((p) => p.identifier.toLowerCase().includes('premium'));

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchaseLoading(pkg.identifier);
    setError(null);
    try {
      await purchasePackage(pkg);
      navigation?.goBack();
    } catch (err: any) {
      if (err.message !== 'Purchase was cancelled') {
        setError(err.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    setError(null);
    try {
      await restorePurchases();
      navigation?.goBack();
    } catch (err: any) {
      setError(err.message || 'Restore failed. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headline}>Choose Your Plan</Text>
        <Text style={styles.subtext}>Unlock the full TutorIQ experience</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Basic Tier */}
        <View style={styles.tierCard}>
          <Text style={styles.tierName}>Basic</Text>
          <Text style={styles.tierPrice}>
            {basicPkg?.product.priceString ?? '~$25/mo'}
          </Text>
          {BASIC_FEATURES.map((feat) => (
            <Text key={feat} style={styles.featureItem}>
              {feat}
            </Text>
          ))}
          <TouchableOpacity
            style={[styles.subscribeButton, purchaseLoading === basicPkg?.identifier && styles.buttonDisabled]}
            onPress={() => basicPkg && handlePurchase(basicPkg)}
            disabled={!basicPkg || purchaseLoading !== null}
          >
            {purchaseLoading === basicPkg?.identifier ? (
              <ActivityIndicator color={theme.colors.textLight} size="small" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                {basicPkg ? 'Subscribe to Basic' : 'Not Available'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Premium Tier */}
        <View style={[styles.tierCard, styles.premiumCard]}>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
          <Text style={styles.tierName}>Premium</Text>
          <Text style={styles.tierPrice}>
            {premiumPkg?.product.priceString ?? '~$35/mo'}
          </Text>
          {PREMIUM_FEATURES.map((feat) => (
            <Text key={feat} style={styles.featureItem}>
              {feat}
            </Text>
          ))}
          <TouchableOpacity
            style={[styles.subscribeButton, styles.premiumButton, purchaseLoading === premiumPkg?.identifier && styles.buttonDisabled]}
            onPress={() => premiumPkg && handlePurchase(premiumPkg)}
            disabled={!premiumPkg || purchaseLoading !== null}
          >
            {purchaseLoading === premiumPkg?.identifier ? (
              <ActivityIndicator color={theme.colors.textLight} size="small" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                {premiumPkg ? 'Subscribe to Premium' : 'Not Available'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreLink}
          onPress={handleRestore}
          disabled={restoreLoading}
        >
          {restoreLoading ? (
            <ActivityIndicator color={theme.colors.textSecondary} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  headline: {
    ...theme.typography.heading2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    textAlign: 'center',
  },
  tierCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.base,
    ...theme.shadows.base,
  },
  premiumCard: {
    borderColor: theme.colors.primary,
  },
  recommendedBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  recommendedText: {
    ...theme.typography.caption,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textLight,
    letterSpacing: 1,
  },
  tierName: {
    ...theme.typography.heading3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  tierPrice: {
    ...theme.typography.heading4,
    color: theme.colors.primary,
    marginBottom: theme.spacing.base,
  },
  featureItem: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  subscribeButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.base,
  },
  premiumButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
  restoreLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  restoreText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
