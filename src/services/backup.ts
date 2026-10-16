import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { fileStamp } from "@/domain/dates";
import type { Sale, StoreSnapshot } from "@/domain/types";

type SalesExportKind = "all" | "debt";

type SalesExportRange = {
  startMs: number;
  endMs: number;
};

export async function exportSnapshot(snapshot: StoreSnapshot): Promise<void> {
  const json = JSON.stringify(snapshot, null, 2);
  const file = new File(Paths.cache, `sarisync-${fileStamp()}.json`);
  file.create({ overwrite: true });
  file.write(json);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Export SariSync data",
    UTI: "public.json",
  });
}

export async function exportSalesAsXlsx(
  snapshot: StoreSnapshot,
  kind: SalesExportKind,
  range: SalesExportRange,
): Promise<void> {
  const startMs = Math.min(range.startMs, range.endMs);
  const endMs = Math.max(range.startMs, range.endMs);
  const matchedSales = snapshot.sales.filter((sale) => {
    if (kind === "debt" && sale.status !== "debt") return false;
    return sale.createdAt >= startMs && sale.createdAt <= endMs;
  });

  const workerById = new Map(
    snapshot.workers.map((worker) => [worker.id, worker.name]),
  );

  const salesByWorker = new Map<string, Sale[]>();

  for (const sale of matchedSales) {
    const sales = salesByWorker.get(sale.workerId) ?? [];
    sales.push(sale);
    salesByWorker.set(sale.workerId, sales);
  }

  const worksheetRows: (string | number)[][] = [];
  const summaryRows: (string | number)[][] = [];
  const dateCells: [number, number][] = [];

  const workerNames = [...salesByWorker.keys()].sort((a, b) => {
    const left = workerById.get(a) ?? a;
    const right = workerById.get(b) ?? b;
    return left.localeCompare(right);
  });

  for (const workerId of workerNames) {
    const workerName = workerById.get(workerId) ?? "Unknown worker";
    const sales = [...(salesByWorker.get(workerId) ?? [])].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    const totalPriceCents = sales.reduce(
      (sum, sale) => sum + sale.quantity * sale.unitSellCents,
      0,
    );
    const totalPrice = totalPriceCents / 100;

    worksheetRows.push([workerName, "", "", ""]);
    worksheetRows.push(["Item", "Quantity", "Price", "Date & Time"]);

    for (const sale of sales) {
      const rowIndex = worksheetRows.length;
      worksheetRows.push([
        sale.itemName,
        sale.quantity,
        (sale.quantity * sale.unitSellCents) / 100,
        excelSerialFromLocalTimestamp(sale.createdAt),
      ]);
      dateCells.push([rowIndex, 3]);
    }

    worksheetRows.push(["Total price", "", totalPrice, ""]);
    worksheetRows.push(["", "", "", ""]);
    summaryRows.push([workerName, totalPrice]);
  }

  if (worksheetRows.length === 0) {
    worksheetRows.push([
      kind === "debt"
        ? "No debt sales in the selected range"
        : "No sales in the selected range",
      "",
      "",
      "",
    ]);
  }

  if (summaryRows.length === 0) {
    summaryRows.push([
      kind === "debt"
        ? "No debt sales in the selected range"
        : "No sales in the selected range",
      "",
    ]);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows);
  const summaryWorksheet = XLSX.utils.aoa_to_sheet([
    ["Name", "Total price"],
    ...summaryRows,
  ]);

  for (const [rowIndex, columnIndex] of dateCells) {
    const cell =
      worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
    if (cell) {
      cell.z = "mmm dd, hh:mm AM/PM";
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

  const xlsxBase64 = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
  const file = new File(Paths.cache, `sarisync-${kind}-${fileStamp()}.xlsx`);
  file.create({ overwrite: true });
  file.write(xlsxBase64, { encoding: "base64" });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(file.uri, {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    dialogTitle:
      kind === "debt" ? "Export debts as Excel" : "Export sales as Excel",
    UTI: "org.openxmlformats.spreadsheetml.sheet",
  });
}

function excelSerialFromLocalTimestamp(timestamp: number): number {
  const date = new Date(timestamp);
  const localAsUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

  return (localAsUtc - Date.UTC(1899, 11, 30)) / 86400000;
}

export async function importSnapshotText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]) return null;
  return new File(result.assets[0].uri).text();
}
