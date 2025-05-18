import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AutoGrowingTextInput } from '@/src/components/AutoGrowingTextInput';
import { Message } from '@/src/components/Message';
import axios from 'axios';
import Constants from 'expo-constants';
import { JournalScreen } from './JournalScreen';
import { primativeColors } from '@/src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '@/src/types';

const API_SERVER_URL = process.env.API_SERVER_URL || Constants?.expoConfig?.extra?.API_SERVER_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || Constants?.expoConfig?.extra?.API_AUTH_TOKEN;

interface ChatScreenProps {
  conversationId: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState(0);

  const PROFILE_IMAGE_SIZE = 72;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      gap: theme.space[2],
    },
    profileContainer: {
      alignItems: 'center',
    },
    profileImage: {
      width: PROFILE_IMAGE_SIZE,
      height: PROFILE_IMAGE_SIZE,
      borderRadius: PROFILE_IMAGE_SIZE / 2,
    },
    chatScreenContent: {
      flex: 1,
    },
    messagesList: {
      flex: 1,
      padding: theme.space[3],
      gap: theme.space[3],
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: theme.colors.border,
      padding: theme.space[3],
      paddingBottom: theme.space[1],
      gap: theme.space[2],
      position: 'relative',
    },
    input: {
      flex: 1,
      backgroundColor: 'transparent',
      fontSize: theme.fontSizes[2],
      maxHeight: 120,
      minHeight: 40,
    },
    bottomBarMask: {
      position: 'absolute',
      bottom: -34,
      left: 0,
      right: 0,
      height: 34,
      backgroundColor: theme.colors.card,
    },
  });

  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
    }
  }, [messages.length]);

  const handleContentSizeChange = useCallback((w: number, h: number) => {
    setContentHeight(h);
  }, []);

  const handleLayout = useCallback((e: any) => {
    setVisibleHeight(e.nativeEvent.layout.height);
  }, []);

  const handleSendMessage = async () => {
    const text = inputText;
    setInputText('');
    if (!text.trim() || isLoading) return;
    const trimmedText = text.trim();
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: Date.now(),
      threadId: conversationId,
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
        threadId: conversationId,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[ChatScreen] Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        text: 'Error: Failed to get reply from server.',
        isUser: false,
        timestamp: Date.now(),
        threadId: conversationId,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    if (inputText.trim().length > 0) {
      handleSendMessage();
    }
  }, [inputText]);

  const handleTextChange = useCallback((text: string) => {
    if (text.endsWith('\n\n')) {
      setInputText('');
      handleSendMessage();
    } else {
      setInputText(text);
    }
  }, [handleSendMessage]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Message message={item as any} />
  );

  // Add a simple thinking indicator
  const renderFooter = () => {
    if (isLoading) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: primativeColors['60'], fontFamily: theme.fonts.body }}>Thinking...</Text>
        </View>
      );
    }
    return null;
  };

  const canSendMessage = inputText.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => setShowJournal(j => !j)} activeOpacity={0.7}>
          <Image
            source={require('../../assets/dad.png')}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showJournal ? (
          <JournalScreen />
        ) : (
          <View style={styles.chatScreenContent}>
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
              ListFooterComponent={renderFooter}
            />
            <View style={styles.inputRow}>
              <View style={styles.bottomBarMask}/>
              <AutoGrowingTextInput
                style={styles.input}
                value={inputText}
                onChangeText={handleTextChange}
                placeholder="Type a message..."
                placeholderTextColor={primativeColors['70']}
                multiline
                onSubmitEditing={() => {
                  if (canSendMessage) {
                    handleSendMessage();
                  }
                }}
                editable={!isLoading}
                textColor={theme.colors.text}
              />
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 