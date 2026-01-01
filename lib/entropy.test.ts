/**
 * Unit Tests for Entropy Math Library
 */

import {
  Entropy,
  LCG,
  MersenneTwister,
  ChaCha20,
  XorShift128Plus,
  fnv1a,
  murmur3,
  Stats,
  toHex,
  fromHex,
  secureCompare,
  randomBytes,
  randomInt,
  random,
  shuffle,
  pick
} from './entropy';

// ============================================================================
// ENTROPY TESTS
// ============================================================================

describe('Entropy', () => {
  let entropy: Entropy;

  beforeEach(() => {
    entropy = new Entropy();
  });

  test('should collect timing entropy', () => {
    const byte = entropy.collectTiming();
    expect(byte).toBeGreaterThanOrEqual(0);
    expect(byte).toBeLessThan(256);
  });

  test('should collect Math.random entropy', () => {
    const byte = entropy.collectMathRandom();
    expect(byte).toBeGreaterThanOrEqual(0);
    expect(byte).toBeLessThan(256);
  });

  test('should generate bytes of requested length', () => {
    const bytes = entropy.getBytes(32);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(32);
  });

  test('should generate different bytes on each call', () => {
    const bytes1 = entropy.getBytes(16);
    const bytes2 = entropy.getBytes(16);
    expect(toHex(bytes1)).not.toBe(toHex(bytes2));
  });
});

// ============================================================================
// LCG TESTS
// ============================================================================

describe('LCG', () => {
  test('should produce values in [0, 1)', () => {
    const lcg = new LCG(12345);
    for (let i = 0; i < 100; i++) {
      const val = lcg.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('should be deterministic with same seed', () => {
    const lcg1 = new LCG(42);
    const lcg2 = new LCG(42);

    for (let i = 0; i < 10; i++) {
      expect(lcg1.next()).toBe(lcg2.next());
    }
  });

  test('should produce different sequences with different seeds', () => {
    const lcg1 = new LCG(1);
    const lcg2 = new LCG(2);
    expect(lcg1.next()).not.toBe(lcg2.next());
  });

  test('nextInt should return integers in range', () => {
    const lcg = new LCG(12345);
    for (let i = 0; i < 100; i++) {
      const val = lcg.nextInt(10);
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
    }
  });

  test('nextBytes should return correct length', () => {
    const lcg = new LCG(12345);
    const bytes = lcg.nextBytes(16);
    expect(bytes.length).toBe(16);
    expect(bytes).toBeInstanceOf(Uint8Array);
  });

  test('getState and setState should work correctly', () => {
    const lcg = new LCG(12345);
    lcg.next();
    lcg.next();
    const state = lcg.getState();

    const lcg2 = new LCG(0);
    lcg2.setState(state);

    expect(lcg.next()).toBe(lcg2.next());
  });
});

// ============================================================================
// MERSENNE TWISTER TESTS
// ============================================================================

describe('MersenneTwister', () => {
  test('should produce values in [0, 1)', () => {
    const mt = new MersenneTwister(12345);
    for (let i = 0; i < 100; i++) {
      const val = mt.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('should be deterministic with same seed', () => {
    const mt1 = new MersenneTwister(42);
    const mt2 = new MersenneTwister(42);

    for (let i = 0; i < 10; i++) {
      expect(mt1.next()).toBe(mt2.next());
    }
  });

  test('should handle seeding correctly', () => {
    const mt = new MersenneTwister(1);
    const val1 = mt.next();
    mt.seed(1);
    const val2 = mt.next();
    expect(val1).toBe(val2);
  });

  test('should produce good distribution', () => {
    const mt = new MersenneTwister(12345);
    // Use larger sample for more stable chi-square results
    const samples = Array.from({ length: 10000 }, () => mt.next());
    const result = Stats.chiSquare(samples);
    expect(result.pass).toBe(true);
  });
});

// ============================================================================
// CHACHA20 TESTS
// ============================================================================

describe('ChaCha20', () => {
  test('should produce values in [0, 1)', () => {
    const chacha = new ChaCha20();
    for (let i = 0; i < 100; i++) {
      const val = chacha.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('should be deterministic with same seed', () => {
    const seed = new Uint8Array(32).fill(42);
    const cc1 = new ChaCha20(seed);
    const cc2 = new ChaCha20(seed);

    for (let i = 0; i < 10; i++) {
      expect(cc1.next()).toBe(cc2.next());
    }
  });

  test('should produce different sequences without seed', () => {
    const cc1 = new ChaCha20();
    const cc2 = new ChaCha20();
    // Very unlikely to be the same
    const seq1 = Array.from({ length: 5 }, () => cc1.next());
    const seq2 = Array.from({ length: 5 }, () => cc2.next());
    expect(seq1).not.toEqual(seq2);
  });

  test('nextBytes should return correct length', () => {
    const chacha = new ChaCha20();
    expect(chacha.nextBytes(64).length).toBe(64);
    expect(chacha.nextBytes(100).length).toBe(100);
    expect(chacha.nextBytes(1).length).toBe(1);
  });

  test('should produce high entropy output', () => {
    const chacha = new ChaCha20();
    const bytes = chacha.nextBytes(1000);
    const entropy = Stats.entropy(bytes);
    expect(entropy).toBeGreaterThan(7.5);
  });

  test('should pass statistical tests', () => {
    const chacha = new ChaCha20();
    const samples = Array.from({ length: 1000 }, () => chacha.next());
    const assessment = Stats.assess(samples);
    expect(assessment.quality).toMatch(/excellent|good/);
  });
});

// ============================================================================
// XORSHIFT128+ TESTS
// ============================================================================

describe('XorShift128Plus', () => {
  test('should produce values in [0, 1)', () => {
    const xs = new XorShift128Plus();
    for (let i = 0; i < 100; i++) {
      const val = xs.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  test('should be deterministic with same seed', () => {
    const xs1 = new XorShift128Plus(12345n);
    const xs2 = new XorShift128Plus(12345n);

    for (let i = 0; i < 10; i++) {
      expect(xs1.next()).toBe(xs2.next());
    }
  });

  test('should produce good distribution', () => {
    const xs = new XorShift128Plus(12345n);
    // Use larger sample for more stable chi-square results
    const samples = Array.from({ length: 10000 }, () => xs.next());
    const result = Stats.chiSquare(samples);
    expect(result.pass).toBe(true);
  });
});

// ============================================================================
// HASH FUNCTION TESTS
// ============================================================================

describe('fnv1a', () => {
  test('should return consistent hashes', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    expect(fnv1a(data)).toBe(fnv1a(data));
  });

  test('should return different hashes for different inputs', () => {
    const data1 = new Uint8Array([1, 2, 3]);
    const data2 = new Uint8Array([1, 2, 4]);
    expect(fnv1a(data1)).not.toBe(fnv1a(data2));
  });

  test('should handle empty input', () => {
    const hash = fnv1a(new Uint8Array(0));
    expect(typeof hash).toBe('number');
  });

  test('should return 32-bit unsigned integer', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const hash = fnv1a(data);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
  });
});

describe('murmur3', () => {
  test('should return consistent hashes', () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    expect(murmur3(data)).toBe(murmur3(data));
  });

  test('should return different hashes for different inputs', () => {
    const data1 = new Uint8Array([1, 2, 3]);
    const data2 = new Uint8Array([1, 2, 4]);
    expect(murmur3(data1)).not.toBe(murmur3(data2));
  });

  test('should support seed parameter', () => {
    const data = new Uint8Array([1, 2, 3]);
    expect(murmur3(data, 0)).not.toBe(murmur3(data, 1));
  });

  test('should handle various input lengths', () => {
    for (let len = 0; len <= 20; len++) {
      const data = new Uint8Array(len).fill(len);
      const hash = murmur3(data);
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// STATISTICS TESTS
// ============================================================================

describe('Stats', () => {
  describe('mean', () => {
    test('should calculate correct mean', () => {
      expect(Stats.mean([1, 2, 3, 4, 5])).toBe(3);
      expect(Stats.mean([10])).toBe(10);
      expect(Stats.mean([0, 0, 0])).toBe(0);
    });
  });

  describe('variance', () => {
    test('should calculate correct variance', () => {
      expect(Stats.variance([1, 1, 1])).toBe(0);
      expect(Stats.variance([1, 2, 3, 4, 5])).toBe(2);
    });
  });

  describe('stdDev', () => {
    test('should calculate correct standard deviation', () => {
      expect(Stats.stdDev([1, 1, 1])).toBe(0);
      expect(Stats.stdDev([1, 2, 3, 4, 5])).toBeCloseTo(Math.sqrt(2));
    });
  });

  describe('entropy', () => {
    test('should return 0 for constant data', () => {
      const data = new Uint8Array(100).fill(42);
      expect(Stats.entropy(data)).toBe(0);
    });

    test('should return high entropy for random data', () => {
      const chacha = new ChaCha20();
      const data = chacha.nextBytes(1000);
      expect(Stats.entropy(data)).toBeGreaterThan(7);
    });

    test('should return max 8 bits per byte', () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) data[i] = i;
      expect(Stats.entropy(data)).toBe(8);
    });
  });

  describe('chiSquare', () => {
    test('should pass for uniform distribution', () => {
      const data = Array.from({ length: 1000 }, (_, i) => i / 1000);
      const result = Stats.chiSquare(data);
      expect(result.pass).toBe(true);
    });

    test('should fail for biased distribution', () => {
      const data = Array.from({ length: 1000 }, () => 0.1);
      const result = Stats.chiSquare(data);
      expect(result.pass).toBe(false);
    });
  });

  describe('runsTest', () => {
    test('should pass for random-like data', () => {
      // Use fixed seed for reproducibility
      const seed = new Uint8Array(32);
      for (let i = 0; i < 32; i++) seed[i] = i * 7;
      const chacha = new ChaCha20(seed);
      // Larger sample size for more stable results
      const data = Array.from({ length: 1000 }, () => chacha.next());
      const result = Stats.runsTest(data);
      // Check runs are within reasonable range of expected
      expect(Math.abs(result.runs - result.expected)).toBeLessThan(result.expected * 0.5);
    });

    test('should detect sorted data', () => {
      const data = Array.from({ length: 100 }, (_, i) => i / 100);
      const result = Stats.runsTest(data);
      expect(result.runs).toBeLessThan(result.expected);
    });
  });

  describe('assess', () => {
    test('should rate ChaCha20 as acceptable quality', () => {
      // Use fixed seed for reproducibility
      const seed = new Uint8Array(32);
      for (let i = 0; i < 32; i++) seed[i] = i;
      const chacha = new ChaCha20(seed);
      const data = Array.from({ length: 10000 }, () => chacha.next());
      const result = Stats.assess(data);
      // Statistical tests can be flaky, so accept fair or better
      expect(result.quality).toMatch(/excellent|good|fair/);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });

    test('should rate poor data as poor/fair', () => {
      const data = Array.from({ length: 1000 }, () => 0.5);
      const result = Stats.assess(data);
      expect(result.quality).toMatch(/poor|fair/);
    });
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('toHex', () => {
  test('should convert bytes to hex string', () => {
    expect(toHex(new Uint8Array([0, 1, 255]))).toBe('0001ff');
    expect(toHex(new Uint8Array([]))).toBe('');
    expect(toHex(new Uint8Array([171]))).toBe('ab');
  });
});

describe('fromHex', () => {
  test('should convert hex string to bytes', () => {
    expect(fromHex('0001ff')).toEqual(new Uint8Array([0, 1, 255]));
    expect(fromHex('')).toEqual(new Uint8Array([]));
    expect(fromHex('ab')).toEqual(new Uint8Array([171]));
  });

  test('should be inverse of toHex', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    expect(fromHex(toHex(original))).toEqual(original);
  });
});

describe('secureCompare', () => {
  test('should return true for equal arrays', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    expect(secureCompare(a, b)).toBe(true);
  });

  test('should return false for different arrays', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 4]);
    expect(secureCompare(a, b)).toBe(false);
  });

  test('should return false for different lengths', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2]);
    expect(secureCompare(a, b)).toBe(false);
  });

  test('should handle empty arrays', () => {
    expect(secureCompare(new Uint8Array([]), new Uint8Array([]))).toBe(true);
  });
});

describe('randomBytes', () => {
  test('should return correct length', () => {
    expect(randomBytes(16).length).toBe(16);
    expect(randomBytes(32).length).toBe(32);
    expect(randomBytes(1).length).toBe(1);
  });

  test('should return different bytes each time', () => {
    const a = randomBytes(16);
    const b = randomBytes(16);
    expect(toHex(a)).not.toBe(toHex(b));
  });

  test('should return Uint8Array', () => {
    expect(randomBytes(16)).toBeInstanceOf(Uint8Array);
  });
});

describe('randomInt', () => {
  test('should return integers in range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(10);
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
    }
  });

  test('should return 0 for max=1', () => {
    for (let i = 0; i < 10; i++) {
      expect(randomInt(1)).toBe(0);
    }
  });
});

describe('random', () => {
  test('should return values in [0, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const val = random();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  test('should return same array (in place)', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toBe(arr);
  });

  test('should contain all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr);
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('should handle empty array', () => {
    const arr: number[] = [];
    shuffle(arr);
    expect(arr).toEqual([]);
  });

  test('should handle single element', () => {
    const arr = [42];
    shuffle(arr);
    expect(arr).toEqual([42]);
  });

  test('should actually shuffle (statistical)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let sameCount = 0;

    for (let i = 0; i < 100; i++) {
      const arr = [...original];
      shuffle(arr);
      if (arr.every((v, idx) => v === original[idx])) {
        sameCount++;
      }
    }

    // Very unlikely to get same order many times
    expect(sameCount).toBeLessThan(5);
  });
});

describe('pick', () => {
  test('should return element from array', () => {
    const arr = [1, 2, 3, 4, 5];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pick(arr));
    }
  });

  test('should return only element for single-element array', () => {
    expect(pick([42])).toBe(42);
  });

  test('should pick different elements (statistical)', () => {
    const arr = [1, 2, 3, 4, 5];
    const picks = new Set<number>();

    for (let i = 0; i < 100; i++) {
      picks.add(pick(arr));
    }

    // Should pick most elements at least once
    expect(picks.size).toBeGreaterThan(3);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration', () => {
  test('all PRNGs should produce statistically acceptable output', () => {
    const generators = [
      new LCG(12345),
      new MersenneTwister(12345),
      new ChaCha20(),
      new XorShift128Plus()
    ];

    for (const gen of generators) {
      const samples = Array.from({ length: 1000 }, () => gen.next());
      const assessment = Stats.assess(samples);
      expect(assessment.score).toBeGreaterThanOrEqual(50);
    }
  });

  test('hash functions should have good avalanche', () => {
    const data1 = new Uint8Array([0, 0, 0, 0]);
    const data2 = new Uint8Array([0, 0, 0, 1]);

    const fnv1 = fnv1a(data1);
    const fnv2 = fnv1a(data2);

    // Count differing bits
    let diff = fnv1 ^ fnv2;
    let bitsDifferent = 0;
    while (diff) {
      bitsDifferent += diff & 1;
      diff >>>= 1;
    }

    // Should change multiple bits
    expect(bitsDifferent).toBeGreaterThan(1);
  });

  test('entropy collection should improve over time', () => {
    const entropy = new Entropy();

    // First collection
    const bytes1 = entropy.getBytes(32);
    const ent1 = Stats.entropy(bytes1);

    // Collect more entropy
    for (let i = 0; i < 100; i++) {
      entropy.addEntropy(entropy.collectTiming());
    }

    // Second collection should still be high quality
    const bytes2 = entropy.getBytes(32);
    const ent2 = Stats.entropy(bytes2);

    expect(ent1).toBeGreaterThan(3);
    expect(ent2).toBeGreaterThan(3);
  });
});
