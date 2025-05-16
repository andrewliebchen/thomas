import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import Constants from 'expo-constants';
import axios from 'axios';

const API_SERVER_URL = process.env.API_SERVER_URL || Constants?.expoConfig?.extra?.API_SERVER_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || Constants?.expoConfig?.extra?.API_AUTH_TOKEN;

export interface JournalEntry {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
}

export const JournalScreen: React.FC = () => {
  const theme = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_SERVER_URL}/api/journal`, {
          params: { limit: 20, offset: 0 },
          headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
        });
        const data = response.data as any;
        console.log('[JournalScreen] API response:', data);
        setEntries(data.journalEntries || []);
        console.log('[JournalScreen] Parsed entries:', data.journalEntries || []);
      } catch (err: any) {
        setError('Failed to load journal entries.');
        console.error('[JournalScreen] Error fetching entries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.space[3],
    },
    entry: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: theme.space[3],
      marginBottom: theme.space[3],
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      marginHorizontal: theme.space[3],
    },
    entryContent: {
      fontSize: theme.fontSizes[2],
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
    },
    entryDate: {
      fontSize: theme.fontSizes[0],
      marginTop: theme.space[3],
    },
    error: {
      color: theme.colors.notification,
      textAlign: 'center',
      marginTop: theme.space[5],
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes[2],
    },
    empty: {
      textAlign: 'center',
      color: theme.colors.muted,
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes[2],
      marginTop: theme.space[5],
    },
  });

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entry}>
      <Text style={styles.entryContent}>{item.content}</Text>
      <Text style={styles.entryDate}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No journal entries found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}; 