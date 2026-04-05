import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProgressStore } from '../store/progressStore';
import { useTutorStore } from '../store/tutorStore';
import { useUpgrade } from '../context/UpgradeContext';
import { SubjectProgress, RecentActivityEntry } from '../interfaces/interfaces';
import { theme } from '../theme';

const formatDate = (d: string | null): string => {
  if (!d) return '—';
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const { hasFeatureAccess } = useUpgrade();
  const { dashboard, isLoading, error, loadDashboard } = useProgressStore();
  const { loadSession } = useTutorStore();

  useEffect(() => {
    if (hasFeatureAccess('PROGRESS_DASHBOARD')) loadDashboard();
  }, []);

  const onRefresh = useCallback(() => { loadDashboard(); }, []);

  if (!hasFeatureAccess('PROGRESS_DASHBOARD')) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.upgradeTitle}>Progress Dashboard</Text>
        <Text style={styles.upgradeSubtext}>Upgrade to Basic or Premium to track your learning progress.</Text>
        <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && !dashboard) {
    return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (error && !dashboard) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDashboard}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
      </View>
    );
  }

  if (!dashboard) return null;

  const maxSessions = Math.max(...dashboard.subjectBreakdown.map((s) => s.sessionCount), 1);

  const handleActivityPress = (sessionId: number) => {
    loadSession(sessionId);
    navigation.navigate('TutorTab');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Streak Banner */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakValue}>{dashboard.currentStreak} Day Streak</Text>
          <Text style={styles.streakLongest}>Longest streak: {dashboard.longestStreak} days</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboard.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboard.totalMessages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDate(dashboard.lastActiveDate)}</Text>
            <Text style={styles.statLabel}>Last Active</Text>
          </View>
        </View>

        {/* Subject Breakdown */}
        <Text style={styles.sectionTitle}>Subjects</Text>
        {dashboard.subjectBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>No subject activity yet.</Text>
        ) : (
          dashboard.subjectBreakdown.map((sp: SubjectProgress) => (
            <View key={sp.subject} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{sp.subject}</Text>
                <Text style={styles.subjectMeta}>{sp.sessionCount} sessions · {sp.messageCount} exchanges</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(sp.sessionCount / maxSessions) * 100}%` }]} />
              </View>
            </View>
          ))
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboard.recentActivity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity yet.</Text>
        ) : (
          dashboard.recentActivity.slice(0, 10).map((entry: RecentActivityEntry) => (
            <TouchableOpacity
              key={entry.sessionId}
              style={styles.activityRow}
              onPress={() => handleActivityPress(entry.sessionId)}
            >
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {entry.title || 'Untitled Session'}
                </Text>
                <View style={styles.activityMeta}>
                  {entry.subject && <Text style={styles.activitySubject}>{entry.subject}</Text>}
                  <Text style={styles.activityMetaText}>{entry.messageCount} msgs · {formatDate(entry.date)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  scrollContent: { padding: theme.spacing.base, paddingBottom: theme.spacing['3xl'] },

  // Streak
  streakCard: {
    backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.primary + '30',
    padding: theme.spacing.xl, alignItems: 'center', marginBottom: theme.spacing.base,
  },
  streakEmoji: { fontSize: 36, marginBottom: theme.spacing.sm },
  streakValue: { ...theme.typography.heading3, color: theme.colors.primary },
  streakLongest: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },

  // Stats
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statValue: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.xs },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },

  // Sections
  sectionTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.md },
  emptyText: { ...theme.typography.body, color: theme.colors.textTertiary, marginBottom: theme.spacing.xl },

  // Subject
  subjectCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base, marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  subjectHeader: { marginBottom: theme.spacing.sm },
  subjectName: { ...theme.typography.bodySmall, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
  subjectMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  progressBarBg: {
    height: 6, backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.full, overflow: 'hidden',
  },
  progressBarFill: {
    height: 6, backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },

  // Activity
  activityRow: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base, marginBottom: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  activityContent: {},
  activityTitle: { ...theme.typography.bodySmall, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  activitySubject: {
    ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary, backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm, paddingVertical: 2,
    borderRadius: theme.borderRadius.sm, overflow: 'hidden',
  },
  activityMetaText: { ...theme.typography.caption, color: theme.colors.textTertiary },

  // Upgrade
  upgradeTitle: { ...theme.typography.heading3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  upgradeSubtext: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
  upgradeButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.md },
  upgradeButtonText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.textLight },

  errorText: { ...theme.typography.body, color: theme.colors.error, marginBottom: theme.spacing.sm },
  retryText: { ...theme.typography.body, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.primary },
});
