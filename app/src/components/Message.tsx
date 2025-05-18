import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StyledText } from '@/src/theme/components';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ChatMessage } from '@/src/types';
import { primativeColors } from '@/src/theme';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const theme = useTheme();
  
  const isUser = message.isUser;
  const styles = StyleSheet.create({
    messageContainer: {
      paddingHorizontal: isUser ? theme.space[3] : 0,
      paddingVertical: isUser ? theme.space[2] : 0,
      borderRadius: isUser ? 20 : 0,
      minHeight: isUser ? 40 : undefined,
      marginLeft: isUser ? theme.space[6] : 0,
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      backgroundColor: isUser ? theme.colors.userBubbleBg : 'transparent',
      borderWidth: 0,
      borderColor: 'transparent',
    },
    messageText: {
      fontSize: isUser ? theme.fontSizes[2] : 20,
      lineHeight: isUser ? 22 : 1.3 * 20,
      color: isUser ? theme.colors.userBubbleText : primativeColors['15'],
      fontFamily: theme.fonts.body,
    },
  });

  // Skip rendering memory context messages
  if (message.isMemoryContext) {
    return null;
  }

  return (
    <View style={styles.messageContainer}>
      <StyledText style={styles.messageText}>
        {message.text}
      </StyledText>
    </View>
  );
}; 