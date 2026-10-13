import { splitNonEmptyLines, uniqueNames } from './lines';

export function parseWorkerLines(text: string): { names: string[]; skipped: number } {
  const names = uniqueNames(splitNonEmptyLines(text).map(({ line }) => line));
  const rawCount = splitNonEmptyLines(text).length;
  return { names, skipped: rawCount - names.length };
}
