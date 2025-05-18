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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <ChatScreen conversationId={'cmahgtzud00pqu0fpxx2erl1a'} />
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
