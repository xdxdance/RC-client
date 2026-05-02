import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const tabBarStyle: Record<string, any> = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 228, 231, 0.5)',
    height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
    paddingTop: 8,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '文章',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="book" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-article"
        options={{
          title: '添加',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="circle-plus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="note-list"
        options={{
          title: '笔记',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="file-lines" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="gear" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
