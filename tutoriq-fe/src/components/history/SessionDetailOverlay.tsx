import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { TutorMessage } from '../../interfaces/interfaces';
import chatHistoryService from '../../services/chatHistoryService';
import MessageBubble from '../tutor/MessageBubble';
import { theme } from '../../theme';

interface SessionDetailOverlayProps {
  visible: boolean;
  sessionId: number | null;
  onClose: () => void;
}

export default function SessionDetailOverlay({
  visible,
  sessionId,
  onClose,
}: SessionDetailOverlayProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && sessionId) {
      loadMessages(sessionId);
    } else {
      setMessages([]);
    }
  }, [visible, sessionId]);

  const loadMessages = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await chatHistoryService.getSessionMessages(id);
      if (result.success) {
        setMessages(result.data);
      }
    } catch {
      // handled silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Detail</Text>
          <View style={{ width: 60 }} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    width: 60,
  },
  backText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  headerTitle: {
    ...theme.typography.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
});
