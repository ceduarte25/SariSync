import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Stat } from '@/components/ui/Stat';
import { exportSnapshot, importSnapshotText } from '@/services/backup';
import { computeTotals } from '@/domain/selectors';
import { useStore } from '@/store/store';
import { space, type } from '@/theme';

export default function BackupScreen() {
  const sales = useStore((state) => state.sales);
  const totals = computeTotals(sales);
  const toSnapshot = useStore((state) => state.toSnapshot);
  const replaceFromJson = useStore((state) => state.replaceFromJson);
  const mergeFromJson = useStore((state) => state.mergeFromJson);

  const exportData = async () => {
    try {
      await exportSnapshot(toSnapshot());
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const importData = (mode: 'replace' | 'merge') => {
    Alert.alert(
      mode === 'replace' ? 'Replace all data?' : 'Merge backup?',
      mode === 'replace'
        ? 'This overwrites workers, items, and sales on this phone.'
        : 'Same IDs will be updated. New rows will be added.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            void (async () => {
              try {
                const text = await importSnapshotText();
                if (text == null) return;
                if (mode === 'replace') replaceFromJson(text);
                else mergeFromJson(text);
                Alert.alert('Imported', 'Offline data is updated.');
              } catch (error) {
                Alert.alert(
                  'Import failed',
                  error instanceof Error ? error.message : 'Unknown error',
                );
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <Text style={type.heading}>This device</Text>
      <View style={styles.stats}>
        <Stat label="Revenue" cents={totals.revenueCents} />
        <Stat label="Profit" cents={totals.profitCents} tone="paid" />
      </View>
      <View style={styles.stats}>
        <Stat label="Paid cash" cents={totals.paidCents} tone="paid" />
        <Stat label="Still owed" cents={totals.debtCents} tone="debt" />
      </View>
      {totals.unknownCostCount > 0 ? (
        <Text style={type.muted}>
          Profit skips {totals.unknownCostCount} sale(s) with no bought price.
        </Text>
      ) : null}

      <Text style={type.heading}>Offline backup</Text>
      <Text style={type.muted}>
        Everything stays on this phone. Share a JSON file to copy data to another device, then import it.
      </Text>
      <Button label="Export JSON" onPress={() => void exportData()} />
      <Button label="Import and merge" variant="secondary" onPress={() => importData('merge')} />
      <Button label="Import and replace" variant="danger" onPress={() => importData('replace')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: space.sm },
});
