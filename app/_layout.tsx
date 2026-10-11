import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pose/[id]" options={{ headerShown: true, title: 'Pose Details', presentation: 'card' }} />
        <Stack.Screen name="live-coach" options={{ headerShown: true, title: 'Live Pose Coach', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="ai-coach" options={{ headerShown: true, title: 'AI Pose Coach', presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings', presentation: 'card' }} />
      </Stack>
    </>
  );
}
