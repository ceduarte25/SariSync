import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SearchField } from '@/components/ui/SearchField';
import { formatMoney } from '@/domain/money';
import { matchesQuery } from '@/lib/search';
import { useStore } from '@/store/store';
import { colors, space } from '@/theme';

export default function ItemsScreen() {
  const items = useStore((state) => state.items);
  const removeItem = useStore((state) => state.removeItem);
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () => items.filter((item) => matchesQuery(item.name, query)),
    [items, query],
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search items" />
            <Button label="Add items" onPress={() => router.push('/items/add')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={query ? 'No match' : 'No items yet'}
            body={'Add lines like "coke - 20 - 25" or "pancit - 45".'}
          />
        }
        renderItem={({ item }) => {
          const profit =
            item.costCents == null ? null : item.sellCents - item.costCents;
          return (
            <Card
              onPress={() =>
                Alert.alert(item.name, 'Remove this item from the catalog?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => removeItem(item.id) },
                ])
              }
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                Sell {formatMoney(item.sellCents)}
                {item.costCents != null ? ` · Bought ${formatMoney(item.costCents)}` : ''}
                {profit != null ? ` · Profit ${formatMoney(profit)}` : ''}
              </Text>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: space.md, gap: space.sm, paddingBottom: space.xl },
  header: { gap: space.md, marginBottom: space.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted, fontWeight: '600' },
});
