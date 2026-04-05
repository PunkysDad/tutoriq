import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface FormattedMessageProps {
  text: string;
  isUser: boolean;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, isUser }) => {
  const cleanText = (raw: string): string => {
    return raw
      .trim()
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '');
  };

  const renderInlineText = (line: string): React.ReactNode => {
    if (!line || typeof line !== 'string') return line;

    const parts = line.split('**');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      if (part === '') return;
      if (index % 2 === 0) {
        elements.push(<Text key={index}>{part}</Text>);
      } else {
        elements.push(
          <Text key={index} style={styles.bold}>
            {part}
          </Text>
        );
      }
    });

    return elements.length > 0 ? elements : line;
  };

  const parseMarkdown = (raw: string) => {
    const cleaned = cleanText(raw);
    const lines = cleaned.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();

      if (trimmed === '') {
        if (elements.length > 0) {
          elements.push(<View key={`sp-${i}`} style={styles.lineBreak} />);
        }
        return;
      }

      if (trimmed.match(/^###\s+/)) {
        elements.push(
          <Text key={i} style={[styles.header3, isUser && styles.userText]}>
            {trimmed.replace(/^###\s+/, '')}
          </Text>
        );
        return;
      }

      if (trimmed.match(/^##\s+/)) {
        elements.push(
          <Text key={i} style={[styles.header2, isUser && styles.userText]}>
            {trimmed.replace(/^##\s+/, '')}
          </Text>
        );
        return;
      }

      if (trimmed.match(/^#\s+/)) {
        elements.push(
          <Text key={i} style={[styles.header1, isUser && styles.userText]}>
            {trimmed.replace(/^#\s+/, '')}
          </Text>
        );
        return;
      }

      if (trimmed.match(/^\d+\.\s/)) {
        const numberMatch = trimmed.match(/^(\d+\.)/);
        const content = trimmed.replace(/^\d+\.\s+/, '');
        elements.push(
          <View key={i} style={styles.bulletContainer}>
            <Text style={[styles.numberBullet, isUser && styles.userText]}>
              {numberMatch?.[1]}
            </Text>
            <View style={styles.bulletTextContainer}>
              <Text style={[styles.bulletText, isUser && styles.userText]}>
                {renderInlineText(content)}
              </Text>
            </View>
          </View>
        );
        return;
      }

      if (trimmed.match(/^[-•*]\s/)) {
        const content = trimmed.replace(/^[-•*]\s+/, '');
        elements.push(
          <View key={i} style={styles.bulletContainer}>
            <Text style={[styles.bullet, isUser && styles.userText]}>•</Text>
            <View style={styles.bulletTextContainer}>
              <Text style={[styles.bulletText, isUser && styles.userText]}>
                {renderInlineText(content)}
              </Text>
            </View>
          </View>
        );
        return;
      }

      elements.push(
        <View key={i} style={styles.paragraphContainer}>
          <Text style={[styles.paragraph, isUser && styles.userText]}>
            {renderInlineText(trimmed)}
          </Text>
        </View>
      );
    });

    return elements;
  };

  return <View>{parseMarkdown(text)}</View>;
};

const styles = StyleSheet.create({
  lineBreak: {
    height: 6,
  },
  header1: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginVertical: 6,
  },
  header2: {
    fontSize: theme.typography.fontSize.base + 1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginVertical: 5,
  },
  header3: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginVertical: 4,
  },
  paragraphContainer: {
    marginBottom: 4,
  },
  paragraph: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    width: 12,
  },
  numberBullet: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    minWidth: 24,
    textAlign: 'left',
  },
  bulletTextContainer: {
    flex: 1,
  },
  bulletText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  bold: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  userText: {
    color: theme.colors.textLight,
  },
});

export default FormattedMessage;
