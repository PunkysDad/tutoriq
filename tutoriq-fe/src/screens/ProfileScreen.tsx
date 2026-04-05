import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useUpgrade } from '../context/UpgradeContext';
import { theme } from '../theme';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { subscriptionTier, restorePurchases } = useUpgrade();
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
    } catch {
      // handled in context
    } finally {
      setRestoring(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.roleBadge}>{user.role}</Text>
            {user.gradeLevel && <Text style={styles.gradeBadge}>Grade {user.gradeLevel}</Text>}
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.tierRow}>
            <Text style={styles.tierLabel}>Current Plan</Text>
            <Text style={styles.tierValue}>{subscriptionTier}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Paywall')}>
            <Text style={styles.actionButtonText}>Manage Subscription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={restoring}>
            {restoring ? (
              <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.base, paddingBottom: theme.spacing['3xl'] },
  profileCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl, alignItems: 'center', marginBottom: theme.spacing.xl,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  name: { ...theme.typography.heading3, color: theme.colors.text, marginBottom: theme.spacing.xs },
  email: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  badgeRow: { flexDirection: 'row', gap: theme.spacing.sm },
  roleBadge: {
    ...theme.typography.caption, fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary, backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full, overflow: 'hidden',
  },
  gradeBadge: {
    ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary, backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full, overflow: 'hidden',
  },
  section: { marginBottom: theme.spacing.xl },
  sectionTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.md },
  tierRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base, marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  tierLabel: { ...theme.typography.body, color: theme.colors.text },
  tierValue: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
  actionButton: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md, alignItems: 'center', marginBottom: theme.spacing.md,
  },
  actionButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  restoreButton: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  restoreText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, textDecorationLine: 'underline' },
  logoutButton: {
    borderWidth: 1, borderColor: theme.colors.error, borderRadius: theme.borderRadius.base,
    paddingVertical: theme.spacing.md, alignItems: 'center',
  },
  logoutText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.error },
});
