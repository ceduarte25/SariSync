import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SearchField } from '@/components/ui/SearchField';
import { Segmented } from '@/components/ui/Segmented';
import { formatMoney, saleTotalCents } from '@/domain/money';
import { matchesQuery } from '@/lib/search';
import { useStore } from '@/store/store';
import type { PaymentStatus } from '@/domain/types';
import { colors, radius, space } from '@/theme';

export default function SaleScreen() {
  const params = useLocalSearchParams<{ workerId?: string | string[] }>();
  const workerParam = Array.isArray(params.workerId) ? params.workerId[0] : params.workerId;
  const workers = useStore((state) => state.workers);
  const items = useStore((state) => state.items);
  const recordSale = useStore((state) => state.recordSale);

  const [workerId, setWorkerId] = useState(workerParam ?? '');
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<PaymentStatus>('debt');
  const [workerQuery, setWorkerQuery] = useState('');
  const [itemQuery, setItemQuery] = useState('');

  useEffect(() => {
    if (workerParam) setWorkerId(workerParam);
  }, [workerParam]);

  const worker = workers.find((row) => row.id === workerId);
  const item = items.find((row) => row.id === itemId);

  const visibleWorkers = useMemo(
    () => workers.filter((row) => matchesQuery(row.name, workerQuery)).slice(0, 8),
    [workers, workerQuery],
  );
  const visibleItems = useMemo(
    () => items.filter((row) => matchesQuery(row.name, itemQuery)).slice(0, 8),
    [items, itemQuery],
  );

  const total = item ? saleTotalCents(quantity, item.sellCents) : 0;

  const submit = () => {
    if (!worker || !item) {
      Alert.alert('Missing details', 'Pick a worker and an item first.');
      return;
    }
    recordSale({ workerId: worker.id, itemId: item.id, quantity, status });
    Alert.alert(
      'Saved',
      `${item.name} for ${worker.name} · ${status === 'debt' ? 'Debt' : 'Paid'} ${formatMoney(total)}`,
    );
    setItemId('');
    setQuantity(1);
  };

  if (workers.length === 0 || items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Not ready to sell"
          body="Add workers and items first, then come back here to record debt or cash sales."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.kicker}>Worker</Text>
      {worker ? (
        <Card onPress={() => setWorkerId('')}>
          <Text style={styles.selected}>{worker.name}</Text>
          <Text style={styles.hint}>Tap to change</Text>
        </Card>
      ) : (
        <>
          <SearchField value={workerQuery} onChangeText={setWorkerQuery} placeholder="Find worker" />
          {visibleWorkers.map((row) => (
            <Card key={row.id} onPress={() => setWorkerId(row.id)}>
              <Text style={styles.option}>{row.name}</Text>
            </Card>
          ))}
        </>
      )}

      <Text style={styles.kicker}>Item</Text>
      {item ? (
        <Card onPress={() => setItemId('')}>
          <Text style={styles.selected}>{item.name}</Text>
          <Text style={styles.hint}>
            {formatMoney(item.sellCents)} each · tap to change
          </Text>
        </Card>
      ) : (
        <>
          <SearchField value={itemQuery} onChangeText={setItemQuery} placeholder="Find item" />
          {visibleItems.map((row) => (
            <Card key={row.id} onPress={() => setItemId(row.id)}>
              <Text style={styles.option}>{row.name}</Text>
              <Text style={styles.hint}>{formatMoney(row.sellCents)}</Text>
            </Card>
          ))}
        </>
      )}

      <Text style={styles.kicker}>Quantity</Text>
      <View style={styles.qtyRow}>
        <Pressable style={styles.qtyBtn} onPress={() => setQuantity((n) => Math.max(1, n - 1))}>
          <Text style={styles.qtyLabel}>−</Text>
        </Pressable>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <Pressable style={styles.qtyBtn} onPress={() => setQuantity((n) => n + 1)}>
          <Text style={styles.qtyLabel}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.kicker}>Payment</Text>
      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { value: 'debt', label: 'Debt' },
          { value: 'paid', label: 'Paid cash' },
        ]}
      />

      <Card>
        <Text style={styles.hint}>Total</Text>
        <Text style={styles.total}>{formatMoney(total)}</Text>
      </Card>

      <Button label="Save sale" onPress={submit} disabled={!worker || !item} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  selected: { fontSize: 18, fontWeight: '800', color: colors.ink },
  option: { fontSize: 16, fontWeight: '700', color: colors.ink },
  hint: { color: colors.muted, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  qtyBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyLabel: { fontSize: 24, fontWeight: '700', color: colors.ink },
  qtyValue: { fontSize: 28, fontWeight: '800', minWidth: 40, textAlign: 'center', color: colors.ink },
  total: { fontSize: 28, fontWeight: '800', color: colors.ink },
});
