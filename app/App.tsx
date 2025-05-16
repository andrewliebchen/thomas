import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ChatScreen } from '@/src/screens/ChatScreen';
import { JournalScreen } from '@/src/screens/JournalScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { MenuProvider } from '@/src/context/MenuContext';
import { MenuSheet } from '@/src/components/MenuSheet';
import { useMenu } from '@/src/context/MenuContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'journal', label: 'Journal' },
];

function AppNavigator() {
  const { isVisible, options, hideMenu } = useMenu();
  const [activeTab, setActiveTab] = useState<'chat' | 'journal'>('chat');

  const theme = {
    colors: {
      background: '#FFF9F2',
      primary: '#FF8B7E',
      text: '#222',
      muted: '#888',
    },
    space: [0, 4, 8, 16, 24],
    fontSizes: [12, 14, 16, 18],
  };

  const styles = StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      padding: theme.space[3],
      justifyContent: 'center',
      gap: theme.space[3],
    },
    tab: {
      paddingVertical: theme.space[1],
      paddingHorizontal: theme.space[4] || 24,
      borderRadius: 20,
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginHorizontal: theme.space[1],
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: theme.fontSizes[2],
    },
    tabTextActive: {
      color: '#FFF',
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as 'chat' | 'journal')}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>
        {activeTab === 'chat' ? (
          <ChatScreen conversationId={'cmahgtzud00pqu0fpxx2erl1a'} />
        ) : (
          <JournalScreen />
        )}
      </View>
      <MenuSheet 
        visible={isVisible}
        onClose={hideMenu}
        options={options}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <MenuProvider>
              <AppNavigator />
            </MenuProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
