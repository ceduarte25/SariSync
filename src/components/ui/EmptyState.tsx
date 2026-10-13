import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '@/theme';

type Props = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={type.heading}>{title}</Text>
      <Text style={[type.muted, styles.body]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: space.xl,
    alignItems: 'center',
    gap: space.sm,
  },
  body: { textAlign: 'center', color: colors.muted, maxWidth: 280 },
});
