import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { ChatScreen } from '@/src/screens/ChatScreen';
import { ListScreen } from '@/src/screens/ListScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@/src/services/database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { DatabaseInitializer } from '@/src/components/DatabaseInitializer';
import { MenuProvider } from '@/src/context/MenuContext';
import { MenuSheet } from '@/src/components/MenuSheet';
import { useMenu } from '@/src/context/MenuContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

type RootStackParamList = {
  Chat: { threadId: string };
  List: undefined;
};

type AppNavigationProp = NativeStackNavigationProp<RootStackParamList, 'List'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const navigation = useNavigation<AppNavigationProp>();
  const { isVisible, options, hideMenu, showMenu } = useMenu();

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

  return (
    <>
      <Stack.Navigator
        initialRouteName="Chat"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF8B7E',
          },
          headerTintColor: '#FFF9F2',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: '#FFF9F2',
          },
          headerBackTitleStyle: {
            fontSize: 16,
          },
          headerTitleAlign: 'center',
          headerShadowVisible: true,
          animation: 'default',
        }}
      >
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{
            title: 'Dad',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="List" 
          component={ListScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      <MenuSheet 
        visible={isVisible}
        onClose={hideMenu}
        options={options}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer>
              <MenuProvider>
                <DatabaseInitializer>
                  <AppNavigator />
                </DatabaseInitializer>
                <StatusBar style="auto" />
              </MenuProvider>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
