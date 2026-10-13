import type { ParseIssue, ParsedCatalogLine } from '../types';
import { parseAmount } from '../money';
import { splitNonEmptyLines } from './lines';

const PRICE_SPLIT = /\s+-\s+/;

export function parseCatalogLines(text: string): {
  items: ParsedCatalogLine[];
  issues: ParseIssue[];
} {
  const items: ParsedCatalogLine[] = [];
  const issues: ParseIssue[] = [];
  const seen = new Set<string>();

  for (const { lineNumber, line } of splitNonEmptyLines(text)) {
    const parsed = parseCatalogLine(line);
    if (!parsed.ok) {
      issues.push({ lineNumber, line, message: parsed.message });
      continue;
    }

    const key = parsed.item.name.toLowerCase();
    if (seen.has(key)) {
      issues.push({ lineNumber, line, message: 'Duplicate item in this list' });
      continue;
    }

    seen.add(key);
    items.push(parsed.item);
  }

  return { items, issues };
}

function parseCatalogLine(
  line: string,
): { ok: true; item: ParsedCatalogLine } | { ok: false; message: string } {
  const parts = line.split(PRICE_SPLIT).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { ok: false, message: 'Use "item - selling" or "item - bought - selling"' };
  }

  const last = parseAmount(parts[parts.length - 1] ?? '');
  if (last == null) {
    return { ok: false, message: 'Selling price must be a number' };
  }

  const maybeCost = parseAmount(parts[parts.length - 2] ?? '');
  if (parts.length >= 3 && maybeCost != null) {
    const name = parts.slice(0, -2).join(' - ').trim();
    if (!name) return { ok: false, message: 'Item name is missing' };
    return { ok: true, item: { name, costCents: maybeCost, sellCents: last } };
  }

  const name = parts.slice(0, -1).join(' - ').trim();
  if (!name) return { ok: false, message: 'Item name is missing' };
  return { ok: true, item: { name, costCents: null, sellCents: last } };
}
