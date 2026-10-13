export type PaymentStatus = 'debt' | 'paid';

export type Worker = {
  id: string;
  name: string;
  createdAt: number;
};

export type CatalogItem = {
  id: string;
  name: string;
  costCents: number | null;
  sellCents: number;
  createdAt: number;
};

export type Sale = {
  id: string;
  workerId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitCostCents: number | null;
  unitSellCents: number;
  status: PaymentStatus;
  createdAt: number;
};

export type StoreSnapshot = {
  version: 1;
  exportedAt: string;
  workers: Worker[];
  items: CatalogItem[];
  sales: Sale[];
};

export type ParsedCatalogLine = {
  name: string;
  costCents: number | null;
  sellCents: number;
};

export type ParseIssue = {
  lineNumber: number;
  line: string;
  message: string;
};

export type Totals = {
  debtCents: number;
  paidCents: number;
  revenueCents: number;
  knownCostCents: number;
  unknownCostCount: number;
  profitCents: number;
};
