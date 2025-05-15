import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDatabase, Thread, Message } from '@/src/services/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useMenu } from '@/src/context/MenuContext';

type RootStackParamList = {
  Chat: { threadId: string };
  List: undefined;
};

type ThreadsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'List'>;

interface ThreadWithLastMessage extends Thread {
  lastDadMessage?: string;
}

export function ThreadsScreen() {
  const navigation = useNavigation<ThreadsScreenNavigationProp>();
  const { showMenu } = useMenu();
  const [threads, setThreads] = useState<ThreadWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewThread = async () => {
    try {
      const db = await getDatabase();
      const threadId = uuidv4();
      const now = Date.now();
      
      // Create the thread first
      await db.createThread({
        id: threadId,
        title: 'New Chat',
        createdAt: now,
        lastMessageAt: now,
      });

      // Navigate to the new chat
      navigation.navigate('Chat', { threadId });
    } catch (error) {
      console.error('Error creating new thread:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 ThreadsScreen mounted');
    loadThreads();
    navigation.setOptions({
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
                label: 'Delete All Threads',
                icon: 'trash-can',
                onPress: () => {
                  Alert.alert(
                    'Delete All Threads',
                    'Are you sure you want to delete all threads? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete All',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            const db = await getDatabase();
                            await db.resetDatabase();
                            loadThreads();
                          } catch (error) {
                            console.error('Error deleting all threads:', error);
                          }
                        },
                      },
                    ]
                  );
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
    return () => {
      console.log('🔍 ThreadsScreen unmounted');
    };
  }, [navigation, showMenu]);

  const loadThreads = async () => {
    console.log('🔍 Loading threads...');
    try {
      setIsLoading(true);
      const db = await getDatabase();
      const loadedThreads = await db.getThreads();
      
      // Get messages for each thread
      const threadsWithLastMessage = await Promise.all(
        loadedThreads.map(async (thread) => {
          const messages = await db.getMessagesForThread(thread.id);
          
          // Find the first user message for the title (if not already set)
          const firstUserMessage = messages.find(m => m.isUser)?.text;
          
          // Find the last Dad message for the summary
          const lastDadMessage = [...messages].reverse().find(m => !m.isUser)?.text;
          
          // If we have a first user message and the thread title is still "New Chat",
          // use the first user message as the title
          const title = thread.title === 'New Chat' && firstUserMessage 
            ? firstUserMessage 
            : thread.title;
          
          return { 
            ...thread, 
            title,
            lastDadMessage 
          };
        })
      );
      
      console.log('🔍 Loaded threads:', threadsWithLastMessage.length);
      setThreads(threadsWithLastMessage);
    } catch (error) {
      console.error('❌ Error loading threads:', error);
      Alert.alert('Error', 'Failed to load threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      const db = await getDatabase();
      await db.deleteThread(threadId);
      setThreads(threads.filter(thread => thread.id !== threadId));
    } catch (error) {
      console.error('Error deleting thread:', error);
      Alert.alert('Error', 'Failed to delete thread');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderItem = ({ item }: { item: ThreadWithLastMessage }) => {
    console.log('🔍 Rendering thread item:', item.id);
    return (
      <View style={styles.threadItem}>
        <TouchableOpacity 
          style={styles.threadContent}
          onPress={() => {
            console.log('🔍 Thread selected:', item.id);
            navigation.navigate('Chat', { threadId: item.id });
          }}
        >
          <Text style={styles.threadTitle}>{formatDate(item.lastMessageAt)}</Text>
          {item.lastDadMessage && (
            <Text style={styles.threadSummary} numberOfLines={2}>
              {item.lastDadMessage}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHiddenItem = ({ item }: { item: ThreadWithLastMessage }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => {
          Alert.alert(
            'Delete Thread',
            'Are you sure you want to delete this thread? This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete', 
                style: 'destructive',
                onPress: () => handleDeleteThread(item.id)
              }
            ]
          );
        }}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const onRowDidOpen = (rowId: string) => {
    console.log('🔍 Row opened:', rowId);
  };

  const onRowDidClose = (rowId: string) => {
    console.log('🔍 Row closed:', rowId);
  };

  console.log('🔍 ThreadsScreen rendering with', threads.length, 'threads');

  return (
    <View style={styles.container}>
      <SwipeListView
        data={threads}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-75}
        disableRightSwipe
        keyExtractor={item => item.id}
        refreshing={isLoading}
        onRefresh={loadThreads}
        style={styles.list}
        onRowDidOpen={onRowDidOpen}
        onRowDidClose={onRowDidClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flex: 1,
  },
  threadItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  threadContent: {
    padding: 16,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  threadSummary: {
    fontSize: 14,
    color: '#666',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 15,
    margin: 4,
    marginBottom: 0,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF3B30',
    right: 0,
  },
}); 