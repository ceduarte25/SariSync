import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createId } from "@/domain/ids";
import { parseCatalogLines } from "@/domain/parsers/catalog";
import { parseWorkerLines } from "@/domain/parsers/workers";
import {
  createSnapshot,
  mergeSnapshots,
  parseSnapshot,
} from "@/domain/snapshot";
import type {
  CatalogItem,
  PaymentStatus,
  Sale,
  StoreSnapshot,
  Worker,
} from "@/domain/types";

type StoreState = {
  workers: Worker[];
  items: CatalogItem[];
  sales: Sale[];
  addWorkersFromText: (text: string) => { added: number; skipped: number };
  removeWorker: (id: string) => void;
  addItemsFromText: (text: string) => { added: number; issues: number };
  removeItem: (id: string) => void;
  recordSale: (input: {
    workerId: string;
    itemId: string;
    quantity: number;
    status: PaymentStatus;
  }) => void;
  setSaleStatus: (saleId: string, status: PaymentStatus) => void;
  settleWorkerDebts: (workerId: string) => number;
  settleAllDebts: () => number;
  removeSale: (saleId: string) => void;
  replaceFromJson: (raw: string) => void;
  mergeFromJson: (raw: string) => void;
  toSnapshot: () => StoreSnapshot;
};

function byName(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      workers: [],
      items: [],
      sales: [],
      addWorkersFromText: (text) => {
        const { names, skipped } = parseWorkerLines(text);
        const existing = new Set(
          get().workers.map((worker) => worker.name.toLowerCase()),
        );
        const now = Date.now();
        const next: Worker[] = [];
        let skippedExisting = skipped;

        for (const name of names) {
          if (existing.has(name.toLowerCase())) {
            skippedExisting += 1;
            continue;
          }
          existing.add(name.toLowerCase());
          next.push({ id: createId(), name, createdAt: now });
        }

        if (next.length) {
          set({ workers: [...get().workers, ...next].sort(byName) });
        }
        return { added: next.length, skipped: skippedExisting };
      },
      removeWorker: (id) => {
        set({
          workers: get().workers.filter((worker) => worker.id !== id),
          sales: get().sales.filter((sale) => sale.workerId !== id),
        });
      },
      addItemsFromText: (text) => {
        const { items, issues } = parseCatalogLines(text);
        const existing = new Set(
          get().items.map((item) => item.name.toLowerCase()),
        );
        const now = Date.now();
        const next: CatalogItem[] = [];
        let extraIssues = issues.length;

        for (const item of items) {
          if (existing.has(item.name.toLowerCase())) {
            extraIssues += 1;
            continue;
          }
          existing.add(item.name.toLowerCase());
          next.push({
            id: createId(),
            name: item.name,
            costCents: item.costCents,
            sellCents: item.sellCents,
            createdAt: now,
          });
        }

        if (next.length) {
          set({ items: [...get().items, ...next].sort(byName) });
        }
        return { added: next.length, issues: extraIssues };
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      recordSale: ({ workerId, itemId, quantity, status }) => {
        const item = get().items.find((row) => row.id === itemId);
        if (!item || quantity < 1) return;
        const sale: Sale = {
          id: createId(),
          workerId,
          itemId: item.id,
          itemName: item.name,
          quantity,
          unitCostCents: item.costCents,
          unitSellCents: item.sellCents,
          status,
          createdAt: Date.now(),
        };
        set({ sales: [sale, ...get().sales] });
      },
      setSaleStatus: (saleId, status) => {
        set({
          sales: get().sales.map((sale) =>
            sale.id === saleId ? { ...sale, status } : sale,
          ),
        });
      },
      settleWorkerDebts: (workerId) => {
        let settled = 0;
        set({
          sales: get().sales.map((sale) => {
            if (sale.workerId !== workerId || sale.status !== "debt")
              return sale;
            settled += 1;
            return { ...sale, status: "paid" as const };
          }),
        });
        return settled;
      },
      settleAllDebts: () => {
        let settled = 0;
        set({
          sales: get().sales.map((sale) => {
            if (sale.status !== "debt") return sale;
            settled += 1;
            return { ...sale, status: "paid" as const };
          }),
        });
        return settled;
      },
      removeSale: (saleId) => {
        set({ sales: get().sales.filter((sale) => sale.id !== saleId) });
      },
      replaceFromJson: (raw) => {
        const snapshot = parseSnapshot(raw);
        set({
          workers: [...snapshot.workers].sort(byName),
          items: [...snapshot.items].sort(byName),
          sales: [...snapshot.sales].sort((a, b) => b.createdAt - a.createdAt),
        });
      },
      mergeFromJson: (raw) => {
        const incoming = parseSnapshot(raw);
        const merged = mergeSnapshots(get().toSnapshot(), incoming);
        set({
          workers: [...merged.workers].sort(byName),
          items: [...merged.items].sort(byName),
          sales: [...merged.sales].sort((a, b) => b.createdAt - a.createdAt),
        });
      },
      toSnapshot: () => createSnapshot(get().workers, get().items, get().sales),
    }),
    {
      name: "site-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ workers, items, sales }) => ({ workers, items, sales }),
    },
  ),
);
