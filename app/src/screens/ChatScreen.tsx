import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TouchableOpacity, Text, Image, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Message } from '@/src/components/Message';
import axios from 'axios';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '@/src/types';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { HeaderBar } from '@/src/components/HeaderBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const API_SERVER_URL = process.env.API_SERVER_URL || Constants?.expoConfig?.extra?.API_SERVER_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || Constants?.expoConfig?.extra?.API_AUTH_TOKEN;

interface ChatScreenProps {
  conversationId: string;
}

// Define the stack param list
export type RootStackParamList = {
  Chat: { conversationId: string };
  Journal: undefined;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Chat'>>();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [pickedImage, setPickedImage] = useState<{
    uri: string;
    base64: string;
    width: number;
    height: number;
  } | null>(null);

  const PROFILE_IMAGE_SIZE = 72;
  const INPUT_LINE_HEIGHT = 24;
  const SEND_BUTTON_HEIGHT = 40;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      
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
      backgroundColor: theme.colors.background,
    },
    messagesList: {
      padding: theme.space[3],
      gap: theme.space[3],
      flexGrow: 1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.card,
      padding: theme.space[3],
      paddingBottom: theme.space[1],
      gap: theme.space[2],
      position: 'relative',
    },
    input: {
      flex: 1,
      backgroundColor: 'transparent',
      fontSize: theme.fontSizes.small,
      minHeight: INPUT_LINE_HEIGHT * 2,
      lineHeight: INPUT_LINE_HEIGHT,
      fontFamily: theme.fonts.body,
      color: theme.colors.text,
      paddingTop: theme.space[1],
      paddingBottom: theme.space[1],
      textAlignVertical: 'top',
    },
    inputActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card,
      paddingBottom: theme.space[3],
      paddingHorizontal: theme.space[3],
    },
    iconButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      gap: theme.space[2],
      // borderWidth: 1,
      // borderColor: 'red',
    },
    iconButton: {
      width: SEND_BUTTON_HEIGHT,
      height: SEND_BUTTON_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    sendButton: {
      backgroundColor: theme.colors.button,
      paddingVertical: theme.space[2],
      paddingHorizontal: theme.space[3],
      borderRadius: SEND_BUTTON_HEIGHT / 2,
      alignSelf: 'flex-end',
      height: SEND_BUTTON_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.buttonDisabled,
    },
    sendButtonText: {
      color: theme.colors.buttonText,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.body,
      fontWeight: 'bold',
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setPickedImage({
        uri: asset.uri,
        base64: asset.base64 || '',
        width: asset.width || 200,
        height: asset.height || 200,
      });
    }
  };

  const handleSendMessage = async () => {
    const text = inputText;
    setInputText('');
    if ((!text.trim() && !pickedImage) || isLoading) return;
    const trimmedText = text.trim();
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedText,
      isUser: true,
      timestamp: Date.now(),
      threadId: conversationId,
      imageUri: pickedImage?.uri,
      imageBase64: pickedImage?.base64,
      imageWidth: pickedImage?.width,
      imageHeight: pickedImage?.height,
    };
    setMessages(prev => [...prev, userMessage]);
    setPickedImage(null);
    try {
      console.log('[ChatScreen] Sending message:', trimmedText);
      console.log('[ChatScreen] Using server URL:', API_SERVER_URL);
      console.log('[ChatScreen] Using auth token:', API_AUTH_TOKEN);
      const response = await axios.post(`${API_SERVER_URL}/api/chat`, {
        auth_token: API_AUTH_TOKEN,
        message: trimmedText,
        image: pickedImage
          ? {
              base64: pickedImage.base64,
              width: pickedImage.width,
              height: pickedImage.height,
              uri: pickedImage.uri,
            }
          : undefined,
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
      scrollToBottom();
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

  const renderMessage = ({ item, index }: { item: ChatMessage, index: number }) => {
    const isLast = index === messages.length - 1;
    return (
      <View style={isLast ? { marginBottom: 16 } : undefined}>
        <Message message={item as any} />
      </View>
    );
  };

  // Add a simple thinking indicator
  const renderFooter = () => {
    if (isLoading) {
      return (
        <View>
          <Text style={{ fontSize: theme.fontSizes.small, color: theme.colors.textSecondary, fontFamily: theme.fonts.body }}>Thinking...</Text>
        </View>
      );
    }
    return null;
  };

  const canSendMessage = inputText.trim().length > 0;

  useEffect(() => {
    const fetchTodaysMessages = async () => {
      try {
        const response = await axios.get(`${API_SERVER_URL}/api/chat`, {
          headers: {
            'Authorization': `Bearer ${API_AUTH_TOKEN}`,
          },
        });
        const data = response.data as { messages: any[] };
        const apiMessages = data.messages || [];
        // Map API messages to ChatMessage type
        const mapped = apiMessages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.direction === 'INCOMING' ? true : false,
          timestamp: new Date(msg.createdAt).getTime(),
          threadId: conversationId,
        }));
        
        setMessages(mapped);
        setInitialLoadDone(true);
        console.log('[ChatScreen] initialLoadDone set to true');
      } catch (error) {
        console.error('[ChatScreen] Error fetching today\'s messages:', error);
      }
    };
    fetchTodaysMessages();
  }, [conversationId]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        center={
          <TouchableOpacity onPress={() => navigation.navigate('Journal')} activeOpacity={0.7}>
            <Image
              source={require('../../assets/dad.png')}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.chatScreenContent}>
          {!initialLoadDone ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => {
                  if (initialLoadDone) {
                    setTimeout(() => {
                      scrollToBottom();
                    }, 50);
                  }
                }}
                onLayout={handleLayout}
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={renderFooter}
              />
              <View style={styles.inputRow}>
                <View style={styles.bottomBarMask}/>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="What do you want to talk about?"
                  placeholderTextColor={theme.colors.textSecondary + '80'}
                  multiline={true}
                  numberOfLines={3}
                  blurOnSubmit={true}
                  editable={!isLoading}
                  // For local dev: send on Enter (iOS only)
                  onSubmitEditing={
                    process.env.NODE_ENV === 'development' && Platform.OS === 'ios'
                      ? handleSendMessage
                      : undefined
                  }
                />
                
              </View>
              <View style={styles.inputActions}>
              <View style={styles.iconButtonContainer}>
              {pickedImage ? (
                <TouchableOpacity onPress={() => setPickedImage(null)}>
                  <Image
                    source={{ uri: pickedImage.uri }}
                    style={{ width: SEND_BUTTON_HEIGHT, height: SEND_BUTTON_HEIGHT, borderRadius: 8, marginLeft: 8 }}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.iconButton} disabled={false} onPress={handlePickImage}>
                  <MaterialCommunityIcons name="camera-outline" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
                <TouchableOpacity style={{...styles.iconButton, opacity: 0.3}} disabled={true} onPress={() => { /* TODO: Microphone functionality */ }}>
                  <MaterialCommunityIcons name="microphone-outline" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!canSendMessage || isLoading) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!canSendMessage || isLoading}
                >
                  <Text style={styles.sendButtonText}>
                    Send
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 