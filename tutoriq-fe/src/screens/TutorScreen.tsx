import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTutorStore } from '../store/tutorStore';
import MessageBubble from '../components/tutor/MessageBubble';
import TypingIndicator from '../components/tutor/TypingIndicator';
import TrialLimitModal from '../components/TrialLimitModal';
import { TutorMessage } from '../interfaces/interfaces';
import { MainStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';

const SUBJECTS = [
  { label: 'Math', value: 'MATH' },
  { label: 'Science', value: 'SCIENCE' },
  { label: 'English', value: 'ENGLISH' },
  { label: 'History', value: 'HISTORY' },
];

type TutorNav = StackNavigationProp<MainStackParamList>;

export default function TutorScreen() {
  const navigation = useNavigation<TutorNav>();
  const {
    activeSession,
    messages,
    isLoadingResponse,
    isSendingMessage,
    error,
    trialLimitHit,
    startNewSession,
    sendMessage,
    clearActiveSession,
    setError,
    clearTrialLimit,
  } = useTutorStore();

  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isLoadingResponse]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSendingMessage) return;

    setInputText('');

    try {
      if (!activeSession) {
        await startNewSession();
      }
      await sendMessage(text);
    } catch {
      // errors handled in store
    }
  };

  const handleNewChat = () => {
    if (hasMessages) {
      Alert.alert(
        'Start a new chat?',
        'Your current session will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'New Chat',
            onPress: () => {
              clearActiveSession();
              setSelectedSubject(null);
            },
          },
        ]
      );
    } else {
      clearActiveSession();
      setSelectedSubject(null);
    }
  };

  const renderItem = ({ item }: { item: TutorMessage }) => (
    <MessageBubble message={item} />
  );

  const renderFooter = () => {
    if (isLoadingResponse) return <TypingIndicator />;
    if (error) {
      return (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Subject Chips (before first message) */}
      {!hasMessages && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subjectRow}
          contentContainerStyle={styles.subjectRowContent}
        >
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.subjectChip, selectedSubject === s.value && styles.subjectChipActive]}
              onPress={() => setSelectedSubject(s.value)}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  selectedSubject === s.value && styles.subjectChipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Message List or Empty State */}
      {hasMessages ? (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Ask your tutor anything</Text>
          <Text style={styles.emptySubtext}>
            TutorIQ will guide you to the answer — not give it to you.
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          placeholderTextColor={theme.colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={2000}
          editable={!isSendingMessage}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isSendingMessage) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSendingMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Trial Limit Modal */}
      <TrialLimitModal
        visible={trialLimitHit}
        onClose={clearTrialLimit}
        onUpgrade={() => {
          clearTrialLimit();
          navigation.navigate('Paywall');
        }}
        limitType="AI_QUESTIONS"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  subjectRow: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  subjectRowContent: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  subjectChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  subjectChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  subjectChipText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  subjectChipTextActive: {
    color: theme.colors.textLight,
  },
  messageList: {
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.heading3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed(theme.typography.fontSize.base),
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
  },
  retryText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    maxHeight: 120,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textLight,
  },
});
