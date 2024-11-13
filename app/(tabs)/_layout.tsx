import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#D1C4E9',
        tabBarStyle: {
          backgroundColor: '#3E2723',
          borderTopWidth: 0,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontFamily: 'monospace',
          color: '#FFD700',
          fontWeight:'700'
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Досягнення',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={focused ? '#FFD700' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Гра',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'fast-food' : 'fast-food-outline'} color={focused ? '#FFD700' : color} />
          ),
        }}
      />
    </Tabs>
  );
}
