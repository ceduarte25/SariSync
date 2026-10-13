export function splitNonEmptyLines(text: string): { lineNumber: number; line: string }[] {
  return text.split(/\r?\n/).flatMap((raw, index) => {
    const line = raw.trim();
    if (!line) return [];
    return [{ lineNumber: index + 1, line }];
  });
}

export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

export function isNewName(existing: string[], name: string): boolean {
  const key = name.toLowerCase();
  return !existing.some((row) => row.toLowerCase() === key);
}
