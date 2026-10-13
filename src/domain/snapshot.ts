import type { CatalogItem, Sale, StoreSnapshot, Worker } from './types';

const VERSION = 1 as const;

export function createSnapshot(
  workers: Worker[],
  items: CatalogItem[],
  sales: Sale[],
  exportedAt = new Date().toISOString(),
): StoreSnapshot {
  return { version: VERSION, exportedAt, workers, items, sales };
}

export function parseSnapshot(raw: string): StoreSnapshot {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (!isRecord(data)) throw new Error('Backup file is empty or invalid.');
  if (data.version !== 1) throw new Error('Unsupported backup version.');

  return {
    version: 1,
    exportedAt: asString(data.exportedAt, new Date().toISOString()),
    workers: asArray(data.workers).map(asWorker),
    items: asArray(data.items).map(asItem),
    sales: asArray(data.sales).map(asSale),
  };
}

export function mergeSnapshots(current: StoreSnapshot, incoming: StoreSnapshot): StoreSnapshot {
  return {
    version: 1,
    exportedAt: incoming.exportedAt,
    workers: mergeById(current.workers, incoming.workers),
    items: mergeById(current.items, incoming.items),
    sales: mergeById(current.sales, incoming.sales),
  };
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const map = new Map(current.map((row) => [row.id, row]));
  for (const row of incoming) map.set(row.id, row);
  return [...map.values()];
}

function asWorker(value: unknown): Worker {
  const row = asRecord(value, 'worker');
  return {
    id: requireString(row.id, 'worker.id'),
    name: requireString(row.name, 'worker.name'),
    createdAt: requireNumber(row.createdAt, 'worker.createdAt'),
  };
}

function asItem(value: unknown): CatalogItem {
  const row = asRecord(value, 'item');
  return {
    id: requireString(row.id, 'item.id'),
    name: requireString(row.name, 'item.name'),
    costCents: optionalNumber(row.costCents),
    sellCents: requireNumber(row.sellCents, 'item.sellCents'),
    createdAt: requireNumber(row.createdAt, 'item.createdAt'),
  };
}

function asSale(value: unknown): Sale {
  const row = asRecord(value, 'sale');
  const status = row.status;
  if (status !== 'debt' && status !== 'paid') {
    throw new Error('Sale status must be debt or paid.');
  }
  return {
    id: requireString(row.id, 'sale.id'),
    workerId: requireString(row.workerId, 'sale.workerId'),
    itemId: requireString(row.itemId, 'sale.itemId'),
    itemName: requireString(row.itemName, 'sale.itemName'),
    quantity: requireNumber(row.quantity, 'sale.quantity'),
    unitCostCents: optionalNumber(row.unitCostCents),
    unitSellCents: requireNumber(row.unitSellCents, 'sale.unitSellCents'),
    status,
    createdAt: requireNumber(row.createdAt, 'sale.createdAt'),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`Invalid ${label} in backup.`);
  return value;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value) throw new Error(`Missing ${label} in backup.`);
  return value;
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Missing ${label} in backup.`);
  }
  return value;
}

function optionalNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}
