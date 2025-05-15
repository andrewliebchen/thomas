import React, { useEffect } from 'react';
import { View, TouchableOpacity, Alert, GestureResponderEvent, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThreadsScreen } from './ThreadsScreen';
import { MemoryScreen } from './MemoryScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../services/database';

type TabParamList = {
  Threads: undefined;
  Memory: undefined;
};

type RootStackParamList = {
  Chat: { threadId: string };
  List: undefined;
};

type ListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'List'>;

const Tab = createBottomTabNavigator<TabParamList>();

export function ListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ListScreenNavigationProp>();

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
    console.log('🔍 ListScreen mounted');
    return () => {
      console.log('🔍 ListScreen unmounted');
    };
  }, []);

  console.log('🔍 ListScreen rendering');

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FF8B7E',
          },
          headerTintColor: '#FFF9F2',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerShadowVisible: true,
          tabBarActiveTintColor: '#FF8B7E',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#FFF9F2',
            borderTopColor: '#FF8B7E',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Threads') {
              iconName = focused ? 'chat' : 'chat-outline';
            } else if (route.name === 'Memory') {
              iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
            }

            return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Threads" 
          component={ThreadsScreen}
          options={{
            title: 'Threads',
          }}
        />
        <Tab.Screen 
          name="Memory" 
          component={MemoryScreen}
          options={{
            title: 'Memory',
          }}
        />
      </Tab.Navigator>
    </View>
  );
} 