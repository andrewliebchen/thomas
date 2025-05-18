import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
}

export const JournalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Journal'>>();
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
      backgroundColor: theme.colors.background,
      paddingTop: theme.space[3],
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
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    pager: {
      flex: 1,
    },
    entry: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: theme.space[4],
      margin: theme.space[3],
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    entryContent: {
      fontSize: theme.fontSizes[3],
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      lineHeight: 26,
    },
    entryDate: {
      fontSize: theme.fontSizes[1],
      fontFamily: theme.fonts.body,
      textAlign: 'center',
      marginBottom: theme.space[2],
      color: theme.colors.textSecondary,
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

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar
        left={
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <MaterialCommunityIcons name="star-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
        center={
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="window-close" size={36} color={theme.colors.text} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <MaterialCommunityIcons name="delete-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      {/* Carousel */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : entries.length === 0 ? (
        <Text style={styles.empty}>No journal entries found.</Text>
      ) : (
        <PagerView style={styles.pager} initialPage={0}>
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