import React from 'react';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ChatScreen } from '@/src/screens/ChatScreen';
import { JournalScreen } from '@/src/screens/JournalScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { MenuProvider } from '@/src/context/MenuContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { theme } from '@/src/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const Stack = createStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <MenuProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Chat"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Chat" component={ChatScreen} initialParams={{ conversationId: 'cmahgtzud00pqu0fpxx2erl1a' }} />
                  <Stack.Screen name="Journal" component={JournalScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </MenuProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
