import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import Constants from 'expo-constants';
import axios from 'axios';
import PagerView from 'react-native-pager-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from './ChatScreen';
import { HeaderBar } from '@/src/components/HeaderBar';

const API_SERVER_URL = process.env.API_SERVER_URL || Constants?.expoConfig?.extra?.API_SERVER_URL;
const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || Constants?.expoConfig?.extra?.API_AUTH_TOKEN;

export interface JournalEntry {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  favorited?: boolean;
}

type JournalEntriesResponse = {
  journalEntries: JournalEntry[];
  totalJournalEntries: number;
};

export const JournalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Journal'>>();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_SERVER_URL}/api/journal`, {
          params: { limit: 20, offset: 0 },
          headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
        });
        const data = response.data as JournalEntriesResponse;
        setEntries(data.journalEntries || []);
      } catch (err: any) {
        setError('Failed to load journal entries.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.card,
      gap: theme.space[2],
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      backgroundColor: theme.colors.border,
      width: theme.space[7] + theme.space[1],
      height: theme.space[7] + theme.space[1],
      borderRadius: (theme.space[7] + theme.space[1]) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    pager: {
      flex: 1,
    },
    entry: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: theme.space[6],
      padding: theme.space[4],
      marginHorizontal: theme.space[3],
    },
    entryContent: {
      fontSize: theme.fontSizes.large,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      lineHeight: theme.lineHeights.large,
    },
    entryDate: {
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.body,
      textAlign: 'center',
      marginBottom: theme.space[2],
      color: theme.colors.textSecondary,
    },
    error: {
      color: theme.colors.button,
      textAlign: 'center',
      marginTop: theme.space[5],
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.small,
    },
    empty: {
      textAlign: 'center',
      color: theme.colors.muted,
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.small,
      marginTop: theme.space[5],
    },
  });

  // Toggle favorited status for the current entry
  const toggleFavorite = async () => {
    const entry = entries[currentPage];
    if (!entry || actionLoading) return;
    setActionLoading(true);
    try {
      const response = await axios.patch(
        `${API_SERVER_URL}/api/journal`,
        { id: entry.id, favorited: !entry.favorited },
        { headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` } }
      );
      const updated = (response.data as { journalEntry: JournalEntry }).journalEntry;
      setEntries((prev) =>
        prev.map((e, idx) =>
          idx === currentPage ? { ...e, favorited: updated.favorited } : e
        )
      );
    } catch (err) {
      // Optionally show error
    } finally {
      setActionLoading(false);
    }
  };

  // Delete the current journal entry with confirmation
  const deleteCurrentEntry = async () => {
    const entry = entries[currentPage];
    if (!entry || actionLoading) return;
    Alert.alert(
      'Delete Journal Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const config: any = {
                headers: { Authorization: `Bearer ${API_AUTH_TOKEN}` },
                data: { id: entry.id },
              };
              await axios.delete(`${API_SERVER_URL}/api/journal`, config);
              setEntries((prev) => {
                const newEntries = prev.filter((_, idx) => idx !== currentPage);
                // Adjust currentPage if needed
                if (newEntries.length === 0) {
                  setCurrentPage(0);
                } else if (currentPage >= newEntries.length) {
                  setCurrentPage(newEntries.length - 1);
                }
                return newEntries;
              });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete journal entry.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        left={
          entries.length > 0 ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleFavorite}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons
                name={entries[currentPage]?.favorited ? 'heart' : 'heart-outline'}
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )
        }
        center={
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="window-close" size={36} color={theme.colors.text} />
          </TouchableOpacity>
        }
        right={
          entries.length > 0 ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={deleteCurrentEntry}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="delete-outline" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )
        }
      />
      {/* Carousel */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>No journal entries found.</Text>
      ) : (
        <PagerView
          style={styles.pager}
          initialPage={0}
          key={entries.length}
          onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
        >
          {entries.map((item, idx) => (
            <View style={styles.entry} key={item.id}>
              <Text style={styles.entryDate}>{
                new Date(item.createdAt).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }).replace(',', '').replace(',', ' at')
              }</Text>
              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.entryContent}>{item.content}</Text>
              </ScrollView>
            </View>
          ))}
        </PagerView>
      )}
    </SafeAreaView>
  );
}; 