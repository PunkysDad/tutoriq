import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, commonStyles } from '../theme';

export default function HomeScreen() {
  return (
    <View style={[commonStyles.container, commonStyles.centered]}>
      <Text style={styles.title}>TutorIQ</Text>
      <Text style={styles.subtitle}>Your AI-powered tutor</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.heading1,
    color: theme.colors.primary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
