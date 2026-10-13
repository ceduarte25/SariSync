import { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

import { SaleRow } from '@/components/sales/SaleRow';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { Stat } from '@/components/ui/Stat';
import { salesForWorker, workerDebtCents } from '@/domain/selectors';
import { useStore } from '@/store/store';
import { space } from '@/theme';

type Filter = 'all' | 'debt' | 'paid';

export default function WorkerDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const navigation = useNavigation();
  const worker = useStore((state) => state.workers.find((row) => row.id === id));
  const sales = useStore((state) => state.sales);
  const setSaleStatus = useStore((state) => state.setSaleStatus);
  const settleWorkerDebts = useStore((state) => state.settleWorkerDebts);
  const removeSale = useStore((state) => state.removeSale);
  const removeWorker = useStore((state) => state.removeWorker);
  const [filter, setFilter] = useState<Filter>('all');

  useLayoutEffect(() => {
    navigation.setOptions({ title: worker?.name ?? 'Worker' });
  }, [navigation, worker?.name]);

  const ledger = useMemo(() => (id ? salesForWorker(sales, id) : []), [sales, id]);
  const debt = id ? workerDebtCents(sales, id) : 0;
  const visible = ledger.filter((sale) => (filter === 'all' ? true : sale.status === filter));

  if (!worker) {
    return (
      <Screen>
        <EmptyState title="Worker not found" body="This person is no longer in the list." />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList
        data={visible}
        keyExtractor={(sale) => sale.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Stat label="Current debt" cents={debt} tone="debt" />
            <Button
              label="Record sale"
              onPress={() => router.push({ pathname: '/(tabs)/sale', params: { workerId: worker.id } })}
            />
            <Button
              label="Mark all debt as paid"
              variant="secondary"
              disabled={debt === 0}
              onPress={() => {
                const count = settleWorkerDebts(worker.id);
                Alert.alert('Settled', `${count} sale(s) marked paid.`);
              }}
            />
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'debt', label: 'Debt' },
                { value: 'paid', label: 'Paid' },
              ]}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState title="No sales yet" body="Record a coke, pancit, or any item." />}
        renderItem={({ item }) => (
          <SaleRow
            sale={item}
            onStatusChange={(status) => setSaleStatus(item.id, status)}
            onDelete={() => removeSale(item.id)}
          />
        )}
        ListFooterComponent={
          <Button
            label="Delete worker"
            variant="danger"
            onPress={() =>
              Alert.alert(worker.name, 'This also deletes their sales.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    removeWorker(worker.id);
                    router.back();
                  },
                },
              ])
            }
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.md, paddingBottom: space.xl },
  header: { gap: space.md, marginBottom: space.md },
});
