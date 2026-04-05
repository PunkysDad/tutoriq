import React, { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  ActivityIndicator, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useParentPortalStore } from '../../store/parentPortalStore';
import { SubjectProgress, RecentActivityEntry } from '../../interfaces/interfaces';
import { ParentStackParamList } from '../../navigation/AppNavigator';
import { theme } from '../../theme';

type Route = RouteProp<ParentStackParamList, 'ChildDashboard'>;

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

export default function ChildDashboardScreen() {
  const { params } = useRoute<Route>();
  const { activeChild, isLoading, error, loadChildDashboard } = useParentPortalStore();

  useEffect(() => { loadChildDashboard(params.childId); }, [params.childId]);
  const onRefresh = useCallback(() => { loadChildDashboard(params.childId); }, [params.childId]);

  if (isLoading && !activeChild) {
    return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (error && !activeChild) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!activeChild) return null;

  const maxSessions = Math.max(...activeChild.subjectBreakdown.map((s) => s.sessionCount), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <Text style={styles.childName}>{activeChild.firstName} {activeChild.lastName}</Text>
        {activeChild.gradeLevel && <Text style={styles.gradeText}>Grade {activeChild.gradeLevel}</Text>}

        {/* Streak Banner */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakValue}>{activeChild.currentStreak} Day Streak</Text>
          <Text style={styles.streakLongest}>Longest: {activeChild.longestStreak} days</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeChild.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeChild.totalMessages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDate(activeChild.lastActiveDate)}</Text>
            <Text style={styles.statLabel}>Last Active</Text>
          </View>
        </View>

        {/* Subject Breakdown */}
        <Text style={styles.sectionTitle}>Subjects</Text>
        {activeChild.subjectBreakdown.length === 0 ? (
          <Text style={styles.emptyText}>No subject activity yet.</Text>
        ) : (
          activeChild.subjectBreakdown.map((sp: SubjectProgress) => (
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
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {activeChild.recentActivity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity.</Text>
        ) : (
          activeChild.recentActivity.slice(0, 10).map((entry: RecentActivityEntry) => (
            <View key={entry.sessionId} style={styles.activityRow}>
              <Text style={styles.activityTitle} numberOfLines={1}>{entry.title || 'Untitled Session'}</Text>
              <View style={styles.activityMeta}>
                {entry.subject && <Text style={styles.activitySubject}>{entry.subject}</Text>}
                <Text style={styles.activityMetaText}>{entry.messageCount} msgs · {formatDate(entry.date)}</Text>
              </View>
            </View>
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
  childName: { ...theme.typography.heading3, color: theme.colors.text },
  gradeText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.base },
  streakCard: {
    backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.primary + '30',
    padding: theme.spacing.xl, alignItems: 'center', marginBottom: theme.spacing.base, marginTop: theme.spacing.md,
  },
  streakEmoji: { fontSize: 36, marginBottom: theme.spacing.sm },
  streakValue: { ...theme.typography.heading3, color: theme.colors.primary },
  streakLongest: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xl },
  statCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: theme.spacing.base, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  statValue: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.xs },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
  sectionTitle: { ...theme.typography.heading4, color: theme.colors.text, marginBottom: theme.spacing.md },
  emptyText: { ...theme.typography.body, color: theme.colors.textTertiary, marginBottom: theme.spacing.xl },
  subjectCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: theme.spacing.base, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  subjectHeader: { marginBottom: theme.spacing.sm },
  subjectName: { ...theme.typography.bodySmall, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text },
  subjectMeta: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
  progressBarBg: { height: 6, backgroundColor: theme.colors.borderLight, borderRadius: theme.borderRadius.full, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full },
  activityRow: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: theme.spacing.base, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  activityTitle: { ...theme.typography.bodySmall, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.text, marginBottom: theme.spacing.xs },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  activitySubject: { ...theme.typography.caption, fontWeight: theme.typography.fontWeight.medium, color: theme.colors.primary, backgroundColor: theme.colors.primary + '15', paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: theme.borderRadius.sm, overflow: 'hidden' },
  activityMetaText: { ...theme.typography.caption, color: theme.colors.textTertiary },
  errorText: { ...theme.typography.body, color: theme.colors.error },
});
