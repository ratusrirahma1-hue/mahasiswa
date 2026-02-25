/**
 * _layout.tsx (di dalam folder (tabs))
 *
 * File ini mendefinisikan LAYOUT untuk tab navigator: tab bar di bawah layar
 * dengan beberapa tab (Home, Explore, Praktikum). Setiap tab menampilkan satu screen
 * sesuai nama file di folder ini (index.tsx, explore.tsx, praktikum.tsx).
 *
 * Underscore _layout = file khusus Expo Router untuk layout, bukan route langsung.
 * (tabs) = route group; URL-nya tidak menyertakan "(tabs)".
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * TabLayout — component yang me-render tab bar dan konfigurasi tiap tab.
 * useColorScheme() dipakai agar warna tab mengikuti tema (terang/gelap) perangkat.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      {/* Tab 1: Home — file index.tsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {/* Tab 2: Explore — file explore.tsx */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      {/* Tab 3: Praktikum — file praktikum.tsx; menampilkan contoh Functional Component */}
      <Tabs.Screen
        name="praktikum"
        options={{
          title: 'Praktikum',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="graduationcap.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
