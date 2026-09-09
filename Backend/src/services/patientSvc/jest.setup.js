try {
  delete globalThis.localStorage;
} catch {
  // Ignore error if property is non-configurable
}
