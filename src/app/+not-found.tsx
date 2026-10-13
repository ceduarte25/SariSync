import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.wrap}>
        <Text style={type.heading}>Screen not found</Text>
        <Link href="/" style={styles.link}>
          Back to workers
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: space.lg,
  },
  link: { color: colors.accent, fontWeight: '700', fontSize: 16 },
});
