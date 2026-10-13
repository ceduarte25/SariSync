import { saleProfitCents, saleTotalCents } from './money';
import type { Sale, Totals } from './types';

export function salesForWorker(sales: Sale[], workerId: string): Sale[] {
  return sales
    .filter((sale) => sale.workerId === workerId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function workerDebtCents(sales: Sale[], workerId: string): number {
  return salesForWorker(sales, workerId)
    .filter((sale) => sale.status === 'debt')
    .reduce((sum, sale) => sum + saleTotalCents(sale.quantity, sale.unitSellCents), 0);
}

export function computeTotals(sales: Sale[]): Totals {
  return sales.reduce<Totals>(
    (acc, sale) => {
      const total = saleTotalCents(sale.quantity, sale.unitSellCents);
      const profit = saleProfitCents(sale.quantity, sale.unitSellCents, sale.unitCostCents);

      acc.revenueCents += total;
      if (sale.status === 'debt') acc.debtCents += total;
      else acc.paidCents += total;

      if (profit == null) acc.unknownCostCount += 1;
      else {
        acc.knownCostCents += sale.quantity * (sale.unitCostCents ?? 0);
        acc.profitCents += profit;
      }

      return acc;
    },
    {
      debtCents: 0,
      paidCents: 0,
      revenueCents: 0,
      knownCostCents: 0,
      unknownCostCount: 0,
      profitCents: 0,
    },
  );
}
