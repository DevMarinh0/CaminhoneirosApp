import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#023e8a',
        tabBarInactiveTintColor: '#90e0ef',
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#0077b6',
          paddingTop: 5,
          height: 60,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="buscaplaca"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cadastromotorista"
        options={{
          title: 'Cadastrar',
          tabBarIcon: ({ color }) => <Ionicons name="person-add" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="listacadastro"
        options={{
          title: 'Listar',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
