import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Stat } from "@/components/ui/Stat";
import {
  exportSnapshot,
  exportSalesAsXlsx,
  importSnapshotText,
} from "@/services/backup";
import { computeTotals } from "@/domain/selectors";
import { useStore } from "@/store/store";
import { colors, space, type } from "@/theme";

type ExportPickerTarget = "start" | "end" | null;

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  ).getTime();
}

function endOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
}

function formatDateLabel(date: Date): string {
  return dateLabelFormatter.format(date);
}

function currentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function BackupScreen() {
  const sales = useStore((state) => state.sales);
  const totals = computeTotals(sales);
  const toSnapshot = useStore((state) => state.toSnapshot);
  const replaceFromJson = useStore((state) => state.replaceFromJson);
  const mergeFromJson = useStore((state) => state.mergeFromJson);
  const settleAllDebts = useStore((state) => state.settleAllDebts);
  const [startDate, setStartDate] = useState(() => currentMonthStart());
  const [endDate, setEndDate] = useState(() => new Date());
  const [pickerTarget, setPickerTarget] = useState<ExportPickerTarget>(null);

  const exportData = async () => {
    try {
      await exportSnapshot(toSnapshot());
    } catch (error) {
      Alert.alert(
        "Export failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const importData = (mode: "replace" | "merge") => {
    Alert.alert(
      mode === "replace" ? "Replace all data?" : "Merge backup?",
      mode === "replace"
        ? "This overwrites workers, items, and sales on this phone."
        : "Same IDs will be updated. New rows will be added.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            void (async () => {
              try {
                const text = await importSnapshotText();
                if (text == null) return;
                if (mode === "replace") replaceFromJson(text);
                else mergeFromJson(text);
                Alert.alert("Imported", "Offline data is updated.");
              } catch (error) {
                Alert.alert(
                  "Import failed",
                  error instanceof Error ? error.message : "Unknown error",
                );
              }
            })();
          },
        },
      ],
    );
  };

  const exportXlsx = async (kind: "all" | "debt") => {
    try {
      await exportSalesAsXlsx(toSnapshot(), kind, {
        startMs: startOfLocalDay(startDate),
        endMs: endOfLocalDay(endDate),
      });
    } catch (error) {
      Alert.alert(
        "Export failed",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleDateChange = (nextDate: Date | undefined) => {
    if (!nextDate || pickerTarget == null) return;

    if (pickerTarget === "start") {
      setStartDate(nextDate);
      if (nextDate.getTime() > endDate.getTime()) {
        setEndDate(nextDate);
      }
    } else {
      setEndDate(nextDate);
      if (nextDate.getTime() < startDate.getTime()) {
        setStartDate(nextDate);
      }
    }
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
      <Button
        label="Mark all debt as paid"
        variant="secondary"
        disabled={totals.debtCents === 0}
        onPress={() => {
          Alert.alert(
            "Mark all debt as paid?",
            "This will clear every unpaid sale for every worker on this device.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Continue",
                onPress: () => {
                  const count = settleAllDebts();
                  Alert.alert("Settled", `${count} sale(s) marked paid.`);
                },
              },
            ],
          );
        }}
      />
      {totals.unknownCostCount > 0 ? (
        <Text style={type.muted}>
          Profit skips {totals.unknownCostCount} sale(s) with no bought price.
        </Text>
      ) : null}

      <Text style={type.heading}>Offline backup</Text>
      <Text style={type.muted}>
        Choose a date range, then export all sales or debts only as Excel.
      </Text>
      <Card onPress={() => setPickerTarget("start")}>
        <Text style={styles.cardLabel}>Date start</Text>
        <Text style={styles.cardValue}>{formatDateLabel(startDate)}</Text>
      </Card>
      <Card onPress={() => setPickerTarget("end")}>
        <Text style={styles.cardLabel}>Date up to</Text>
        <Text style={styles.cardValue}>{formatDateLabel(endDate)}</Text>
      </Card>
      {pickerTarget ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={pickerTarget === "start" ? startDate : endDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onValueChange={(_, date) => {
              handleDateChange(date);
              if (Platform.OS !== "ios") {
                setPickerTarget(null);
              }
            }}
            onDismiss={() => setPickerTarget(null)}
          />
          {Platform.OS === "ios" ? (
            <Button
              label="Done"
              variant="secondary"
              onPress={() => setPickerTarget(null)}
            />
          ) : null}
        </View>
      ) : null}
      <Button
        label="Export debts XLSX"
        variant="secondary"
        onPress={() => void exportXlsx("debt")}
      />
      <Button
        label="Export all sales XLSX"
        onPress={() => void exportXlsx("all")}
      />
      <Button label="Export JSON" onPress={() => void exportData()} />
      <Button
        label="Import and merge"
        variant="secondary"
        onPress={() => importData("merge")}
      />
      <Button
        label="Import and replace"
        variant="danger"
        onPress={() => importData("replace")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: space.sm },
  pickerWrap: { gap: space.sm },
  cardLabel: { fontSize: 13, fontWeight: "700", color: colors.muted },
  cardValue: { fontSize: 17, fontWeight: "800", color: colors.ink },
});
