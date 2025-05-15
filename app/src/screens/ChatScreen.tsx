import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { getDatabase } from '../services/database';
import type { Thread } from '@/src/services/database';
import type { ChatMessage } from '@/src/types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AutoGrowingTextInput } from '@/src/components/AutoGrowingTextInput';
import { Message } from '@/src/components/Message';
import { MicrophoneButton } from '@/src/components/MicrophoneButton';
import { createNewThread, loadThread } from '@/src/utils/threadUtils';
import { prepareConversationHistory, sendMessageAndGetResponse } from '@/src/utils/messageUtils';
import { memoryService } from '../services/memory';
import { transcribeAudio } from '@/src/services/openai';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useMenu } from '@/src/context/MenuContext';

type RootStackParamList = {
  Chat: { threadId: string };
  List: undefined;
};

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

const isDevelopment = process.env.NODE_ENV === 'development';

export const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const flatListRef = useRef<FlatList>(null);
  const { showMenu } = useMenu();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMemoryProcessing, setIsMemoryProcessing] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF",
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
      backgroundColor: "#FFF",
      alignItems: 'flex-end',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      gap: theme.space[2],
    },
    input: {
      flex: 1,
      paddingVertical: theme.space[2],
      backgroundColor: "transparent",
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
    memoryIndicator: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      zIndex: 1,
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

  const loadMessages = useCallback(async (threadId: string) => {
    try {
      const db = await getDatabase();
      const messages = await db.getMessagesForThread(threadId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  }, []);

  const loadThreadData = useCallback(async (threadId: string) => {
    try {
      const thread = await loadThread(threadId);
      if (thread) {
        setCurrentThread(thread);
      }
    } catch (error) {
      console.error('Error loading thread data:', error);
    }
  }, []);

  const handleNewThread = useCallback(async () => {
    try {
      const threadId = await createNewThread();
      navigation.replace('Chat', { threadId });
    } catch (error) {
      console.error('Error creating new thread:', error);
      Alert.alert('Error', 'Failed to create new thread');
    }
  }, [navigation]);

  const handleSendMessage = async (text: string) => {
    if (!currentThreadId || !text.trim() || isLoading) return;

    const trimmedText = text.trim();
    setInputText(''); // Clear input immediately when starting to send
    setIsLoading(true);
    
    const db = await getDatabase();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: Date.now(),
      threadId: currentThreadId
    };

    try {
      // If this is the first message in the thread, update the thread title
      if (messages.length === 0) {
        await db.updateThreadTitle(currentThreadId, trimmedText);
      }

      // Save and show user message immediately
      await db.saveMessage(userMessage);
      setMessages(prev => [...prev, userMessage]);
      await memoryService.addMessageToBuffer(userMessage);

      // Then get and show bot response
      const allMessages = [...messages, userMessage];
      const openAIMessages = await prepareConversationHistory(allMessages, currentThreadId);
      const response = await sendMessageAndGetResponse(userMessage, openAIMessages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: Date.now(),
        threadId: currentThreadId
      };

      // Save and show bot message
      await db.saveMessage(assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      await memoryService.addMessageToBuffer(assistantMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback(() => {
    if (inputText.trim().length > 0) {
      handleSendMessage(inputText);
    }
  }, [inputText, handleSendMessage]);

  const handleTextChange = useCallback((text: string) => {
    // Check if the text ends with a newline character
    if (text.endsWith('\n')) {
      // Check if the previous character was also a newline (double Enter)
      const lastNewlineIndex = text.lastIndexOf('\n');
      const secondLastNewlineIndex = text.lastIndexOf('\n', lastNewlineIndex - 1);
      
      // If there are two consecutive newlines, it's likely a double Enter
      if (secondLastNewlineIndex === lastNewlineIndex - 1) {
        // Remove the last newline character
        const trimmedText = text.slice(0, -1);
        
        // Send message if we have text
        if (trimmedText.trim().length > 0) {
          handleSendMessage(trimmedText);
        }
        return;
      }
    }
    
    setInputText(text);
  }, [handleSendMessage]);

  const handleAudioRecordingComplete = useCallback(async (audioFile: File) => {
    console.log('Audio recording completed, file size:', audioFile.size);
    if (!currentThreadId || isLoading) {
      console.log('Cannot process audio: currentThreadId or isLoading check failed', { currentThreadId, isLoading });
      return;
    }
    
    setIsTranscribing(true);
    console.log('Starting transcription process...');
    
    try {
      // Transcribe the audio
      const db = await getDatabase();
      const transcribedText = await transcribeAudio(audioFile);
      console.log('Transcription completed, text:', transcribedText);
      
      if (transcribedText && transcribedText.trim()) {
        console.log('Sending transcribed text as message...');
        // Send the transcribed text as a message
        await handleSendMessage(transcribedText);
        console.log('Transcribed message sent successfully');
      } else {
        console.log('Transcription returned empty text');
        Toast.show({
          type: 'error',
          text1: 'Transcription failed',
          text2: 'Could not transcribe the audio. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error in handleAudioRecordingComplete:', error);
      Toast.show({
        type: 'error',
        text1: 'Transcription failed',
        text2: 'An error occurred while transcribing the audio.',
      });
    } finally {
      setIsTranscribing(false);
      console.log('Transcription process completed');
    }
  }, [currentThreadId, isLoading, handleSendMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const cleanupEmptyThread = useCallback(async (threadId: string) => {
    try {
      const db = await getDatabase();
      const messages = await db.getMessagesForThread(threadId);
      
      // If there are no messages, delete the thread
      if (messages.length === 0) {
        console.log('🔍 Cleaning up empty thread:', threadId);
        await db.deleteThread(threadId);
      }
    } catch (error) {
      console.error('Error cleaning up empty thread:', error);
    }
  }, []);

  useEffect(() => {
    if (route?.params?.threadId) {
      setCurrentThreadId(route.params.threadId);
    } else {
      // If no threadId is provided, create a new thread
      handleNewThread();
    }
  }, [route?.params?.threadId, handleNewThread]);

  useEffect(() => {
    if (currentThreadId) {
      loadMessages(currentThreadId);
      loadThreadData(currentThreadId);
    }
  }, [currentThreadId, loadMessages, loadThreadData]);

  // Add cleanup effect when navigating away
  useEffect(() => {
    return () => {
      if (currentThreadId) {
        cleanupEmptyThread(currentThreadId);
      }
    };
  }, [currentThreadId, cleanupEmptyThread]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('List')} style={{ marginLeft: 10 }}>
          <MaterialCommunityIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => {
            showMenu([
              {
                label: 'New Thread',
                icon: 'chat-plus',
                onPress: handleNewThread,
              },
              {
                label: 'Delete Thread',
                icon: 'trash-can',
                onPress: () => {
                  if (currentThreadId) {
                    Alert.alert(
                      'Delete Thread',
                      'Are you sure you want to delete this thread? This action cannot be undone.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const db = await getDatabase();
                              await db.deleteThread(currentThreadId);
                              navigation.navigate('List');
                            } catch (error) {
                              console.error('Error deleting thread:', error);
                            }
                          },
                        },
                      ]
                    );
                  }
                },
                destructive: true,
              },
            ]);
          }} 
          style={{ marginRight: 10 }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleNewThread, currentThreadId, showMenu]);

  useEffect(() => {
    const handleProcessingState = (isProcessing: boolean) => {
      setIsMemoryProcessing(isProcessing);
    };

    memoryService.setUpdateCallback((message) => {
      const notificationMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        isUser: false,
        timestamp: Date.now(),
        threadId: currentThreadId || '',
        isMemoryContext: true
      };
      setMessages(prev => [...prev, notificationMessage]);
    });

    memoryService.addProcessingStateCallback(handleProcessingState);

    return () => {
      memoryService.setUpdateCallback(() => {});
      memoryService.removeProcessingStateCallback(handleProcessingState);
    };
  }, [currentThreadId]);

  if (isDevelopment) {
    useEffect(() => {
      console.log('Detailed debug send button state:', {
        isLoading,
        currentThreadId,
        inputText,
        inputTextTrimLength: inputText.trim().length,
        canSendMessage: inputText.trim().length > 0,
      });
    }, [isLoading, currentThreadId, inputText]);
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Message message={item} />
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
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={true}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          />
          <View style={[
            styles.inputContainer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : theme.space[2] }
          ]}>
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
              editable={!isLoading && !isTranscribing}
              textColor={theme.colors.text}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: canSendMessage && !isLoading && !isTranscribing ? 1 : 0.5 }
                ]}
                onPress={handleSend}
                disabled={!canSendMessage || isLoading || isTranscribing}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
              {isMemoryProcessing && (
                <View style={styles.memoryIndicator}>
                  <MaterialCommunityIcons name="brain" size={12} color={theme.colors.primary} />
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 