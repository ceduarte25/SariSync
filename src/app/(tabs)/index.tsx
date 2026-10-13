import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SearchField } from '@/components/ui/SearchField';
import { Stat } from '@/components/ui/Stat';
import { formatMoney } from '@/domain/money';
import { computeTotals, workerDebtCents } from '@/domain/selectors';
import { matchesQuery } from '@/lib/search';
import { useStore } from '@/store/store';
import { colors, space } from '@/theme';

export default function WorkersScreen() {
  const workers = useStore((state) => state.workers);
  const sales = useStore((state) => state.sales);
  const [query, setQuery] = useState('');
  const totals = useMemo(() => computeTotals(sales), [sales]);

  const rows = useMemo(
    () =>
      workers
        .filter((worker) => matchesQuery(worker.name, query))
        .map((worker) => ({
          worker,
          debt: workerDebtCents(sales, worker.id),
        })),
    [workers, sales, query],
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.worker.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Stat label="Outstanding debt" cents={totals.debtCents} tone="debt" />
            <SearchField value={query} onChangeText={setQuery} placeholder="Search workers" />
            <Button label="Add workers" onPress={() => router.push('/workers/add')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={query ? 'No match' : 'No workers yet'}
            body="Add names one per line, then record sales as debt or cash."
          />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/workers/${item.worker.id}`)}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <Text style={styles.name}>{item.worker.name}</Text>
                <Text style={[styles.meta, item.debt > 0 && styles.debt]}>
                  {item.debt > 0 ? `Debt ${formatMoney(item.debt)}` : 'No debt'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.md, gap: space.sm, paddingBottom: space.xl },
  header: { gap: space.md, marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted, fontWeight: '600' },
  debt: { color: colors.debt },
  chevron: { fontSize: 28, color: colors.muted, lineHeight: 28 },
});
