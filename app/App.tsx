import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ChatScreen } from '@/src/screens/ChatScreen';
import { JournalScreen } from '@/src/screens/JournalScreen';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { MenuProvider } from '@/src/context/MenuContext';
import { MenuSheet } from '@/src/components/MenuSheet';
import { useMenu } from '@/src/context/MenuContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { theme } from '@/src/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const TABS = [
  { key: 'chat', label: 'Chat', icon: 'message-processing' },
  { key: 'journal', label: 'Journal', icon: 'brain' },
];

function AppNavigator() {
  const { isVisible, options, hideMenu } = useMenu();
  const [activeTab, setActiveTab] = useState<'chat' | 'journal'>('chat');
  const insets = useSafeAreaInsets();

  const TAB_HEIGHT = 40;
  const TAB_BAR_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const styles = StyleSheet.create({
    tabBar: {
      position: 'absolute',
      top: TAB_BAR_TOP,
      zIndex: 100,
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      padding: theme.space[1],
      borderRadius: 100,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      display: 'flex',
      gap: theme.space[2],
      alignSelf: 'center',
    },
    tab: {
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: 'transparent',
      borderWidth: 0,
      justifyContent: 'center',
      display: 'flex',
      
      height: TAB_HEIGHT,
      width: TAB_HEIGHT * 2,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
    },
    tabIconActive: {
      color: '#FFF',
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.tabBar, { backgroundColor: theme.colors.card }]} edges={['top']} pointerEvents="box-none">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as 'chat' | 'journal')}
              activeOpacity={0.85}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={30}
                style={styles.tabIcon}
                color={isActive ? '#FFF' : theme.colors.primary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        {activeTab === 'chat' ? (
          <ChatScreen conversationId={'cmahgtzud00pqu0fpxx2erl1a'} />
        ) : (
          <JournalScreen />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
