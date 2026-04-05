import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  Alert, ActivityIndicator, RefreshControl, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useParentPortalStore } from '../../store/parentPortalStore';
import { useUpgrade } from '../../context/UpgradeContext';
import { ParentChildSummary } from '../../interfaces/interfaces';
import { ParentStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

type Nav = StackNavigationProp<ParentStackParamList>;

const formatDate = (d: string | null): string => {
  if (!d) return 'Never';
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ParentHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { hasFeatureAccess } = useUpgrade();
  const { children, isLoading, isLinking, error, loadChildren, linkChild, unlinkChild } = useParentPortalStore();

  const [showLink, setShowLink] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => { if (hasFeatureAccess('PARENT_PORTAL')) loadChildren(); }, []);

  const onRefresh = useCallback(() => { loadChildren(); }, []);

  if (!hasFeatureAccess('PARENT_PORTAL')) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.upgradeTitle}>Parent Portal</Text>
        <Text style={styles.upgradeSubtext}>Upgrade to Basic or Premium to view your child's progress.</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate('Paywall' as any)}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLink = async () => {
    if (!linkEmail.trim()) return;
    setLinkError(null);
    try {
      await linkChild(linkEmail.trim());
      setShowLink(false);
      setLinkEmail('');
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link student account');
    }
  };

  const handleUnlink = (child: ParentChildSummary) => {
    Alert.alert(
      `Unlink ${child.firstName}?`,
      'You will no longer be able to view their activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlink', style: 'destructive', onPress: () => unlinkChild(child.childId) },
      ]
    );
  };

  const renderChild = ({ item }: { item: ParentChildSummary }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => navigation.navigate('ChildDashboard', { childId: item.childId })}
    >
      <View style={styles.childHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.childName}>{item.firstName} {item.lastName}</Text>
          {item.gradeLevel && <Text style={styles.gradeText}>Grade {item.gradeLevel}</Text>}
        </View>
        <TouchableOpacity onPress={() => handleUnlink(item)}>
          <Text style={styles.unlinkText}>Unlink</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.childStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🔥 {item.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDate(item.lastActiveDate)}</Text>
          <Text style={styles.statLabel}>Last Active</Text>
        </View>
      </View>

      {item.subjectPreferences.length > 0 && (
        <View style={styles.subjectsRow}>
          {item.subjectPreferences.map((s) => (
            <Text key={s} style={styles.subjectBadge}>{s}</Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && children.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && children.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadChildren}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
        </View>
      ) : children.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No linked students yet</Text>
          <Text style={styles.emptySubtext}>Tap + to link your child's account.</Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(c) => c.childId.toString()}
          renderItem={renderChild}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowLink(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Link Modal */}
      <Modal visible={showLink} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Link a Student</Text>
            <Text style={styles.modalSubtext}>Enter your child's TutorIQ email address</Text>
            {linkError && <Text style={styles.modalError}>{linkError}</Text>}
            <TextInput
              style={styles.modalInput}
              placeholder="child@example.com"
              placeholderTextColor={theme.colors.textTertiary}
              value={linkEmail}
              onChangeText={setLinkEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => { setShowLink(false); setLinkEmail(''); setLinkError(null); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.linkButton, (!linkEmail.trim() || isLinking) && styles.buttonDisabled]}
                onPress={handleLink}
                disabled={!linkEmail.trim() || isLinking}
              >
                {isLinking ? (
                  <ActivityIndicator size="small" color={theme.colors.textLight} />
                ) : (
                  <Text style={styles.linkButtonText}>Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  list: { padding: theme.spacing.base },
  childCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base, marginBottom: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm,
  },
  childHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  childName: { ...theme.typography.heading4, color: theme.colors.text },
  gradeText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  unlinkText: { ...theme.typography.caption, color: theme.colors.error, fontWeight: theme.typography.fontWeight.medium },
  childStats: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
  statLabel: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
  subjectBadge: {
    ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary, backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm, paddingVertical: 2,
    borderRadius: theme.borderRadius.sm, overflow: 'hidden',
  },
  fab: { position: 'absolute', bottom: theme.spacing.xl, right: theme.spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.lg },
  fabText: { fontSize: 28, color: theme.colors.textLight, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: theme.spacing.xl },
  modalCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl },
  modalTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.xs },
  modalSubtext: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.base },
  modalError: { ...theme.typography.bodySmall, color: theme.colors.error, marginBottom: theme.spacing.sm },
  modalInput: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.base, padding: theme.spacing.md, ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.base },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: theme.spacing.lg },
  cancelText: { ...theme.typography.body, color: theme.colors.textSecondary },
  linkButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  buttonDisabled: { opacity: 0.5 },
  linkButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  upgradeTitle: { ...theme.typography.heading3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  upgradeSubtext: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
  upgradeButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  upgradeButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },
  emptyTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.sm },
  emptySubtext: { ...theme.typography.body, color: theme.colors.textSecondary },
  errorText: { ...theme.typography.body, color: theme.colors.error },
  retryText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary, marginTop: theme.spacing.sm },
});
