// Fix Node 22 global localStorage getter issue in Jest
try {
  delete globalThis.localStorage;
} catch (err) {
  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: undefined,
      configurable: true,
      writable: true,
    });
  } catch (e) {}
}


