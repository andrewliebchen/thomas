import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StyledText } from '@/src/theme/components';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ChatMessage } from '@/src/types';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    messageContainer: {
      maxWidth: '85%',
      paddingHorizontal: theme.space[3],
      paddingVertical: theme.space[2],
      borderRadius: 16,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 1,
      elevation: 1,
      marginVertical: theme.space[1],
      marginLeft: message.isUser ? 12 : 12,
      marginRight: message.isUser ? 12 : 12,
      alignSelf: message.isUser ? 'flex-end' : 'flex-start',
      backgroundColor: message.isUser 
        ? theme.colors.primary 
        : theme.colors.card,
    },
    messageText: {
      fontSize: theme.fontSizes[2],
      lineHeight: 20,
      color: message.isUser 
        ? '#FFFFFF' 
        : theme.colors.text,
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