import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Dimensions, Alert, Clipboard } from 'react-native';
import { getDatabase } from '../services/database';
import { useTheme } from '@/src/theme/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memoryService } from '../services/memory';
import { useMenu } from '@/src/context/MenuContext';
import { useNavigation } from '@react-navigation/native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export function MemoryScreen() {
  const [memory, setMemory] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingMemory, setIsProcessingMemory] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const theme = useTheme();
  const windowHeight = Dimensions.get('window').height;
  const navigation = useNavigation();
  const { showMenu } = useMenu();

  useEffect(() => {
    loadMemory();

    // Subscribe to memory processing state
    const handleProcessingState = (isProcessing: boolean) => {
      setIsProcessingMemory(isProcessing);
    };
    memoryService.addProcessingStateCallback(handleProcessingState);

    // Set up navigation options
    const headerRight = () => (
      <TouchableOpacity 
        onPress={() => {
          showMenu([
            {
              label: 'Copy to Clipboard',
              icon: 'content-copy',
              onPress: () => {
                Clipboard.setString(memory);
                Toast.show({
                  type: 'success',
                  text1: 'Copied to clipboard',
                  position: 'bottom',
                });
              },
            },
            {
              label: 'Delete Memory',
              icon: 'trash-can',
              onPress: () => {
                Alert.alert(
                  'Delete Memory',
                  'Are you sure you want to delete this memory? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const db = await getDatabase();
                          await db.deleteMemory();
                          setMemory('');
                          setEditedContent('');
                          setLastUpdated(null);
                        } catch (error) {
                          console.error('Error deleting memory:', error);
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
    );

    navigation.setOptions({ headerRight });

    return () => {
      memoryService.removeProcessingStateCallback(handleProcessingState);
      // Clean up navigation options when component unmounts
      navigation.setOptions({ headerRight: undefined });
    };
  }, [navigation, memory, showMenu]);

  const loadMemory = async () => {
    try {
      setIsLoading(true);
      const db = await getDatabase();
      const memoryData = await db.getMemory();
      if (memoryData) {
        setMemory(memoryData.content);
        setEditedContent(memoryData.content);
        setLastUpdated(new Date(memoryData.lastUpdated));
      }
    } catch (error) {
      console.error('Error loading memory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (isProcessingMemory) {
      Alert.alert(
        'Memory Processing',
        'Please wait until memory processing is complete before saving changes.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const db = await getDatabase();
      await db.updateMemory(editedContent);
      setMemory(editedContent);
      setLastUpdated(new Date());
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving memory:', error);
      Alert.alert('Error', 'Failed to save memory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (isProcessingMemory) {
      Alert.alert(
        'Memory Processing',
        'Please wait until memory processing is complete before resetting.'
      );
      return;
    }

    Alert.alert(
      'Reset Memory',
      'Are you sure you want to reset Dad\'s memory? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const db = await getDatabase();
              await db.updateMemory('');
              setMemory('');
              setEditedContent('');
              setLastUpdated(new Date());
              setIsEditing(false);
            } catch (error) {
              console.error('Error resetting memory:', error);
              Alert.alert('Error', 'Failed to reset memory');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    headerLabel: {
      fontSize: 12,
      color: theme.colors.text + '80',
      marginBottom: 2,
    },
    headerDate: {
        fontWeight: '500',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    processingBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    processingText: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
    },
    input: {
      minHeight: windowHeight - 200,
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      textAlignVertical: 'top',
      padding: 0,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      opacity: isProcessingMemory ? 0.5 : 1,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          {isProcessingMemory && (
            <View style={styles.processingBadge}>
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
          {isEditing ? (
            <Text style={styles.headerText}>Editing...</Text>
          ) : (
            <>
              <Text style={styles.headerLabel}>Last updated</Text>
              <Text style={styles.headerDate}>
                {lastUpdated ? formatDate(lastUpdated) : 'No memory yet'}
              </Text>
            </>
          )}
        </View>
        <View style={styles.headerActions}>
          {isEditing ? (
            <View style={{ flexDirection: 'row', gap: 8, marginLeft: 16 }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setEditedContent(memory);
                  setIsEditing(false);
                }}
                disabled={isProcessingMemory}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSave}
                disabled={isProcessingMemory}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, { marginLeft: 16 }]}
              onPress={() => setIsEditing(true)}
              disabled={isProcessingMemory}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            scrollEnabled={false}
            autoFocus
            editable={!isProcessingMemory}
          />
        ) : (
          <Text style={styles.text}>{memory || 'No memory yet.'}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 