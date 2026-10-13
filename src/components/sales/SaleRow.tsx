import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatSaleStamp } from '@/domain/dates';
import { formatMoney, saleTotalCents } from '@/domain/money';
import type { PaymentStatus, Sale } from '@/domain/types';
import { colors, radius, space } from '@/theme';

type Props = {
  sale: Sale;
  onStatusChange: (status: PaymentStatus) => void;
  onDelete: () => void;
};

export function SaleRow({ sale, onStatusChange, onDelete }: Props) {
  const total = saleTotalCents(sale.quantity, sale.unitSellCents);
  const isDebt = sale.status === 'debt';

  return (
    <Pressable
      onLongPress={() =>
        Alert.alert(sale.itemName, 'Remove this sale?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ])
      }
      style={styles.row}
    >
      <View style={styles.body}>
        <Text style={styles.title}>
          {sale.itemName}
          {sale.quantity > 1 ? ` ×${sale.quantity}` : ''}
        </Text>
        <Text style={styles.meta}>{formatSaleStamp(sale.createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.money}>{formatMoney(total)}</Text>
        <Pressable
          onPress={() => onStatusChange(isDebt ? 'paid' : 'debt')}
          style={[styles.badge, isDebt ? styles.debt : styles.paid]}
        >
          <Text style={[styles.badgeLabel, isDebt ? styles.debtLabel : styles.paidLabel]}>
            {isDebt ? 'Debt' : 'Paid'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.muted },
  right: { alignItems: 'flex-end', gap: 6 },
  money: { fontSize: 16, fontWeight: '800', color: colors.ink },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  debt: { backgroundColor: colors.debtSoft },
  paid: { backgroundColor: colors.paidSoft },
  badgeLabel: { fontSize: 12, fontWeight: '800' },
  debtLabel: { color: colors.debt },
  paidLabel: { color: colors.paid },
});
