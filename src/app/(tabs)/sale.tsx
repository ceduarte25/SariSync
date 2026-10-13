import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { SearchField } from "@/components/ui/SearchField";
import { Segmented } from "@/components/ui/Segmented";
import { formatMoney, saleTotalCents } from "@/domain/money";
import { matchesQuery } from "@/lib/search";
import { useStore } from "@/store/store";
import type { PaymentStatus } from "@/domain/types";
import { colors, radius, space } from "@/theme";

type SelectedItem = {
  itemId: string;
  quantity: number;
};

export default function SaleScreen() {
  const workers = useStore((state) => state.workers);
  const items = useStore((state) => state.items);
  const recordSale = useStore((state) => state.recordSale);

  const [workerId, setWorkerId] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [status, setStatus] = useState<PaymentStatus>("debt");
  const [workerQuery, setWorkerQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");

  const worker = workers.find((row) => row.id === workerId);

  const visibleWorkers = useMemo(
    () =>
      workers.filter((row) => matchesQuery(row.name, workerQuery)).slice(0, 8),
    [workers, workerQuery],
  );
  const visibleItems = useMemo(() => {
    const selectedIds = new Set(selectedItems.map((entry) => entry.itemId));
    const selected = items.filter((row) => selectedIds.has(row.id));

    if (!itemQuery) {
      return selected;
    }

    const matched = items.filter((row) => matchesQuery(row.name, itemQuery));
    const merged = [...matched];

    for (const row of selected) {
      if (!merged.some((entry) => entry.id === row.id)) {
        merged.push(row);
      }
    }

    return merged.slice(0, 8);
  }, [items, itemQuery, selectedItems]);

  const selectedById = useMemo(
    () => new Map(selectedItems.map((entry) => [entry.itemId, entry.quantity])),
    [selectedItems],
  );
  const selectedLines = useMemo(
    () =>
      selectedItems
        .map((entry) => {
          const item = items.find((row) => row.id === entry.itemId);
          if (!item) return null;
          return { item, quantity: entry.quantity };
        })
        .filter(
          (row): row is { item: (typeof items)[number]; quantity: number } =>
            row !== null,
        ),
    [items, selectedItems],
  );
  const total = selectedLines.reduce(
    (sum, line) => sum + saleTotalCents(line.quantity, line.item.sellCents),
    0,
  );

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.some((entry) => entry.itemId === itemId);
      if (exists) {
        return prev.filter((entry) => entry.itemId !== itemId);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((entry) => {
          if (entry.itemId !== itemId) return entry;
          const quantity = entry.quantity + delta;
          return quantity > 0 ? { ...entry, quantity } : null;
        })
        .filter((entry): entry is SelectedItem => entry !== null),
    );
  };

  const submit = () => {
    if (!worker || selectedLines.length === 0) {
      Alert.alert(
        "Missing details",
        "Pick a worker and at least one item first.",
      );
      return;
    }

    for (const line of selectedLines) {
      recordSale({
        workerId: worker.id,
        itemId: line.item.id,
        quantity: line.quantity,
        status,
      });
    }

    const count = selectedLines.length;
    Alert.alert(
      "Saved",
      `${count} item${count > 1 ? "s" : ""} for ${worker.name} · ${status === "debt" ? "Debt" : "Paid"} ${formatMoney(total)}`,
    );
    setSelectedItems([]);
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
        <Card onPress={() => setWorkerId("")}>
          <Text style={styles.selected}>{worker.name}</Text>
          <Text style={styles.hint}>Tap to change</Text>
        </Card>
      ) : (
        <>
          <SearchField
            value={workerQuery}
            onChangeText={setWorkerQuery}
            placeholder="Find worker"
          />
          {Boolean(workerQuery) &&
            visibleWorkers.map((row) => (
              <Card key={row.id} onPress={() => setWorkerId(row.id)}>
                <Text style={styles.option}>{row.name}</Text>
              </Card>
            ))}
        </>
      )}

      <Text style={styles.kicker}>Item</Text>
      <SearchField
        value={itemQuery}
        onChangeText={setItemQuery}
        placeholder="Find item"
      />
      {(Boolean(itemQuery) || selectedItems.length > 0) &&
        visibleItems.map((row) => {
          const quantity = selectedById.get(row.id);
          const isSelected = quantity != null;

          return (
            <Card key={row.id} onPress={() => toggleItem(row.id)}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.option}>{row.name}</Text>
                  <Text style={styles.hint}>{formatMoney(row.sellCents)}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.rightQtyRow}>
                    <Pressable
                      style={styles.miniQtyBtn}
                      onPress={(event) => {
                        event.stopPropagation();
                        updateQuantity(row.id, -1);
                      }}
                    >
                      <Text style={styles.miniQtyLabel}>−</Text>
                    </Pressable>
                    <Text style={styles.miniQtyValue}>{quantity}</Text>
                    <Pressable
                      style={styles.miniQtyBtn}
                      onPress={(event) => {
                        event.stopPropagation();
                        updateQuantity(row.id, 1);
                      }}
                    >
                      <Text style={styles.miniQtyLabel}>+</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.addTag}>Add</Text>
                )}
              </View>
            </Card>
          );
        })}

      <Text style={styles.kicker}>Payment</Text>
      <Segmented
        value={status}
        onChange={setStatus}
        options={[
          { value: "debt", label: "Debt" },
          { value: "paid", label: "Paid cash" },
        ]}
      />

      <Card>
        <Text style={styles.hint}>Total</Text>
        <Text style={styles.total}>{formatMoney(total)}</Text>
      </Card>

      <Button
        label="Save sale"
        onPress={submit}
        disabled={!worker || selectedLines.length === 0}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
  },
  selected: { fontSize: 18, fontWeight: "800", color: colors.ink },
  option: { fontSize: 16, fontWeight: "700", color: colors.ink },
  hint: { color: colors.muted, fontWeight: "600" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  itemInfo: { flex: 1, gap: 4 },
  rightQtyRow: { flexDirection: "row", alignItems: "center", gap: space.xs },
  miniQtyBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  miniQtyLabel: { fontSize: 18, fontWeight: "700", color: colors.ink },
  miniQtyValue: {
    minWidth: 24,
    textAlign: "center",
    fontWeight: "800",
    color: colors.ink,
  },
  addTag: { color: colors.muted, fontWeight: "700" },
  total: { fontSize: 28, fontWeight: "800", color: colors.ink },
});
