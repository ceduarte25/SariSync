export function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto);
  }

  // Fallback for runtimes that do not expose Web Crypto (common in React Native).
  const nowHex = Date.now().toString(16);
  const randHex = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(
    16,
  );
  return `${nowHex}-${randHex}`;
}
