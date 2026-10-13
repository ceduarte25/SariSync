import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useStore } from '@/store/store';
import { colors } from '@/theme';

const stackScreenOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.ink,
  contentStyle: { backgroundColor: colors.bg },
} as const;

export default function RootLayout() {
  const [ready, setReady] = useState(useStore.persist.hasHydrated());

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useStore.persist.onFinishHydration(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workers/add" options={{ title: 'Add workers' }} />
        <Stack.Screen name="workers/[id]" options={{ title: 'Worker' }} />
        <Stack.Screen name="items/add" options={{ title: 'Add items' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
