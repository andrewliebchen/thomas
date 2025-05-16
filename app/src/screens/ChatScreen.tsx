import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AutoGrowingTextInput } from '@/src/components/AutoGrowingTextInput';
import { Message } from '@/src/components/Message';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';

// Minimal local ChatMessage type
type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
};

const API_SERVER_URL = process.env.API_SERVER_URL || Constants?.expoConfig?.extra?.API_SERVER_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || Constants?.expoConfig?.extra?.API_AUTH_TOKEN;

interface ChatScreenProps {
  conversationId: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF',
    },
    chatContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: theme.space[2],
    },
    messagesList: {
      flexGrow: 1,
      paddingBottom: theme.space[3],
    },
    inputContainer: {
      flexDirection: 'row',
      padding: theme.space[3],
      backgroundColor: '#FFF',
      alignItems: 'flex-end',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      gap: theme.space[2],
    },
    input: {
      flex: 1,
      paddingVertical: theme.space[2],
      backgroundColor: 'transparent',
      fontSize: theme.fontSizes[2],
      maxHeight: 120,
      minHeight: 40,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Platform.OS === 'ios' ? 6 : 2,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });

  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
    }
  }, [messages.length]);

  const handleContentSizeChange = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleLayout = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const trimmedText = text.trim();
    setInputText('');
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    try {
      console.log('[ChatScreen] Sending message:', trimmedText);
      console.log('[ChatScreen] Using server URL:', API_SERVER_URL);
      console.log('[ChatScreen] Using auth token:', API_AUTH_TOKEN);
      const response = await axios.post(`${API_SERVER_URL}/api/chat`, {
        auth_token: API_AUTH_TOKEN,
        message: trimmedText,
      });
      console.log('[ChatScreen] Server response:', response.data);
      const reply = (response.data as { reply?: string })?.reply || '';
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[ChatScreen] Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        text: 'Error: Failed to get reply from server.',
        isUser: false,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    if (inputText.trim().length > 0) {
      handleSendMessage(inputText);
    }
  }, [inputText]);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Message message={item as any} />
  );

  const canSendMessage = inputText.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleLayout}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentInset={{ top: 60, bottom: 0, left: 0, right: 0 }}
          />
          <View style={styles.inputContainer}>
            <AutoGrowingTextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.text + '80'}
              multiline
              onSubmitEditing={() => {
                if (canSendMessage) {
                  handleSend();
                }
              }}
              editable={!isLoading}
              textColor={theme.colors.text}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: canSendMessage && !isLoading ? 1 : 0.5 }
                ]}
                onPress={handleSend}
                disabled={!canSendMessage || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 