import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/domain/money';
import { colors, radius, space } from '@/theme';

type Props = {
  label: string;
  cents: number;
  tone?: 'default' | 'debt' | 'paid';
};

export function Stat({ label, cents, tone = 'default' }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          tone === 'debt' && { color: colors.debt },
          tone === 'paid' && { color: colors.paid },
        ]}
      >
        {formatMoney(cents)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: 4,
  },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  value: { color: colors.ink, fontSize: 18, fontWeight: '800' },
});
