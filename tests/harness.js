// tests/harness.js
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(k => deepEqual(a[k], b[k]));
}

const results = [];

export function describe(name, fn) {
  try { fn(); } catch (e) { console.error(`Suite error: ${name}`, e); }
}

export function it(description, fn) {
  try {
    fn();
    results.push({ pass: true, description });
    console.log(`✅ ${description}`);
  } catch (e) {
    results.push({ pass: false, description, error: e.message });
    console.error(`❌ ${description}: ${e.message}`);
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeGreaterThan(n) {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeLessThanOrEqual(n) {
      if (actual > n) throw new Error(`Expected ${actual} <= ${n}`);
    },
    toBeTrue() {
      if (actual !== true) throw new Error(`Expected true, got ${actual}`);
    },
    toBeFalse() {
      if (actual !== false) throw new Error(`Expected false, got ${actual}`);
    },
    toHaveLength(len) {
      if (actual.length !== len)
        throw new Error(`Expected length ${len}, got ${actual.length}`);
    },
  };
}

export function getResults() { return results; }
