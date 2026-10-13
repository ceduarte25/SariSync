const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatMoney(cents: number): string {
  return formatter.format(fromCents(cents));
}

export function parseAmount(raw: string): number | null {
  const normalized = raw.replace(/[₱Php,\s]/gi, '').trim();
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return toCents(value);
}

export function saleTotalCents(quantity: number, unitSellCents: number): number {
  return quantity * unitSellCents;
}

export function saleProfitCents(
  quantity: number,
  unitSellCents: number,
  unitCostCents: number | null,
): number | null {
  if (unitCostCents == null) return null;
  return quantity * (unitSellCents - unitCostCents);
}
