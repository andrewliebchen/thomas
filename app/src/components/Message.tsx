import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
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
      fontSize: isUser ? theme.fontSizes.small : theme.fontSizes.large,
      lineHeight: isUser ? theme.lineHeights.small : theme.lineHeights.large,
      color: isUser ? theme.colors.userBubbleText : theme.colors.text,
      fontFamily: theme.fonts.body,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 20,
      marginBottom: -theme.space[3],
      alignSelf: 'flex-end',
    },
  });

  // Skip rendering memory context messages
  if (message.isMemoryContext) {
    return null;
  }

  return (
    <View style={{gap: theme.space[2]}}>
      {message.imageUri && (
        <Image
          source={{ uri: message.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={[styles.messageContainer, {marginRight: message.imageUri && theme.space[3], marginTop: message.imageUri && -theme.space[4]}]}>
        <StyledText style={styles.messageText}>
          {message.text}
        </StyledText>
      </View>
    </View>
  );
}; 