import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TutorMessage } from '../../interfaces/interfaces';
import FormattedMessage from './FormattedMessage';
import { theme } from '../../theme';

interface MessageBubbleProps {
  message: TutorMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER';

  const timestamp = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : (
          <FormattedMessage text={message.content} isUser={false} />
        )}
      </View>
      <Text style={[styles.timestamp, isUser && styles.timestampUser]}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.base,
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  bubbleAssistant: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
  },
  timestamp: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  timestampUser: {
    textAlign: 'right',
  },
});
