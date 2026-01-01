/**
 * Lightweight Entropy Math Library
 * Zero dependencies, pure TypeScript
 */

// ============================================================================
// ENTROPY SOURCES
// ============================================================================

export class Entropy {
  private pool: number[] = [];
  private poolSize = 256;

  /**
   * Collect entropy from high-resolution timer
   */
  collectTiming(): number {
    const t = performance.now();
    return ((t * 1000000) % 256) ^ ((t * 7919) % 256);
  }

  /**
   * Collect entropy from Math.random (not cryptographic, but adds mixing)
   */
  collectMathRandom(): number {
    return Math.floor(Math.random() * 256);
  }

  /**
   * Mix a byte into the entropy pool
   */
  addEntropy(byte: number): void {
    this.pool.push(byte & 0xFF);
    if (this.pool.length > this.poolSize) {
      this.pool.shift();
    }
  }

  /**
   * Get mixed entropy bytes
   */
  getBytes(count: number): Uint8Array {
    const result = new Uint8Array(count);

    // Collect fresh entropy
    for (let i = 0; i < 16; i++) {
      this.addEntropy(this.collectTiming());
      this.addEntropy(this.collectMathRandom());
    }

    // Mix and extract
    for (let i = 0; i < count; i++) {
      let mixed = 0;
      for (let j = 0; j < this.pool.length; j++) {
        mixed ^= this.pool[j] * (j + i + 1);
        mixed = (mixed * 31 + 17) & 0xFF;
      }
      result[i] = mixed ^ this.collectTiming();
    }

    return result;
  }
}

// ============================================================================
// PSEUDO-RANDOM NUMBER GENERATORS
// ============================================================================

/**
 * Linear Congruential Generator
 * Fast but predictable - NOT for cryptography
 */
export class LCG {
  private state: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 0x100000000;

  constructor(seed?: number) {
    this.state = seed ?? Date.now() & 0xFFFFFFFF;
  }

  next(): number {
    this.state = (this.a * this.state + this.c) >>> 0;
    return this.state / this.m;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextBytes(count: number): Uint8Array {
    const bytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      bytes[i] = this.nextInt(256);
    }
    return bytes;
  }

  /** Get current state (for analysis) */
  getState(): number {
    return this.state;
  }

  /** Set state (for reproducibility) */
  setState(state: number): void {
    this.state = state >>> 0;
  }
}

/**
 * Mersenne Twister (MT19937)
 * Better distribution, still predictable with enough samples
 */
export class MersenneTwister {
  private mt: Uint32Array;
  private index: number;

  constructor(seed?: number) {
    this.mt = new Uint32Array(624);
    this.index = 625;
    this.seed(seed ?? Date.now());
  }

  seed(s: number): void {
    this.mt[0] = s >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = this.mt[i - 1];
      this.mt[i] = ((0x6c078965 * (prev ^ (prev >>> 30))) + i) >>> 0;
    }
    this.index = 624;
  }

  private twist(): void {
    for (let i = 0; i < 624; i++) {
      const y = (this.mt[i] & 0x80000000) | (this.mt[(i + 1) % 624] & 0x7fffffff);
      this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
      if (y & 1) this.mt[i] ^= 0x9908b0df;
    }
    this.index = 0;
  }

  next(): number {
    if (this.index >= 624) this.twist();

    let y = this.mt[this.index++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    return (y >>> 0) / 0xFFFFFFFF;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextBytes(count: number): Uint8Array {
    const bytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      bytes[i] = this.nextInt(256);
    }
    return bytes;
  }
}

/**
 * ChaCha20 CSPRNG
 * Cryptographically secure stream cipher
 */
export class ChaCha20 {
  private state: Uint32Array;
  private buffer: Uint8Array;
  private pos: number;

  constructor(seed?: Uint8Array) {
    this.state = new Uint32Array(16);
    this.buffer = new Uint8Array(64);
    this.pos = 64;

    // Initialize with constants
    this.state[0] = 0x61707865;
    this.state[1] = 0x3320646e;
    this.state[2] = 0x79622d32;
    this.state[3] = 0x6b206574;

    // Use provided seed or generate from entropy
    const key = seed ?? new Entropy().getBytes(32);
    for (let i = 0; i < 8; i++) {
      this.state[4 + i] = key[i * 4] | (key[i * 4 + 1] << 8) |
                          (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24);
    }

    // Counter and nonce
    this.state[12] = 0;
    this.state[13] = 0;
    this.state[14] = Date.now() & 0xFFFFFFFF;
    this.state[15] = (Date.now() / 0x100000000) & 0xFFFFFFFF;
  }

  private rotl(x: number, n: number): number {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  private quarterRound(x: Uint32Array, a: number, b: number, c: number, d: number): void {
    x[a] = (x[a] + x[b]) >>> 0; x[d] = this.rotl(x[d] ^ x[a], 16);
    x[c] = (x[c] + x[d]) >>> 0; x[b] = this.rotl(x[b] ^ x[c], 12);
    x[a] = (x[a] + x[b]) >>> 0; x[d] = this.rotl(x[d] ^ x[a], 8);
    x[c] = (x[c] + x[d]) >>> 0; x[b] = this.rotl(x[b] ^ x[c], 7);
  }

  private block(): void {
    const x = new Uint32Array(this.state);

    for (let i = 0; i < 10; i++) {
      this.quarterRound(x, 0, 4, 8, 12);
      this.quarterRound(x, 1, 5, 9, 13);
      this.quarterRound(x, 2, 6, 10, 14);
      this.quarterRound(x, 3, 7, 11, 15);
      this.quarterRound(x, 0, 5, 10, 15);
      this.quarterRound(x, 1, 6, 11, 12);
      this.quarterRound(x, 2, 7, 8, 13);
      this.quarterRound(x, 3, 4, 9, 14);
    }

    for (let i = 0; i < 16; i++) {
      const v = (x[i] + this.state[i]) >>> 0;
      this.buffer[i * 4] = v & 0xFF;
      this.buffer[i * 4 + 1] = (v >>> 8) & 0xFF;
      this.buffer[i * 4 + 2] = (v >>> 16) & 0xFF;
      this.buffer[i * 4 + 3] = (v >>> 24) & 0xFF;
    }

    this.state[12]++;
    if (this.state[12] === 0) this.state[13]++;
    this.pos = 0;
  }

  nextByte(): number {
    if (this.pos >= 64) this.block();
    return this.buffer[this.pos++];
  }

  next(): number {
    const b = this.nextBytes(4);
    return ((b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0) / 0xFFFFFFFF;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextBytes(count: number): Uint8Array {
    const result = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      result[i] = this.nextByte();
    }
    return result;
  }
}

// ============================================================================
// XORSHIFT FAMILY (Fast and decent quality)
// ============================================================================

/**
 * XorShift128+
 * Very fast, good statistical properties
 */
export class XorShift128Plus {
  private s0: bigint;
  private s1: bigint;

  constructor(seed?: bigint) {
    const s = seed ?? BigInt(Date.now()) * 0x123456789ABCDEFn;
    this.s0 = s & 0xFFFFFFFFFFFFFFFFn;
    this.s1 = (s * 0x5851F42D4C957F2Dn) & 0xFFFFFFFFFFFFFFFFn;
    if (this.s0 === 0n) this.s0 = 1n;
    if (this.s1 === 0n) this.s1 = 1n;
  }

  next(): number {
    let s1 = this.s0;
    const s0 = this.s1;
    this.s0 = s0;
    s1 ^= (s1 << 23n) & 0xFFFFFFFFFFFFFFFFn;
    this.s1 = s1 ^ s0 ^ (s1 >> 18n) ^ (s0 >> 5n);
    const result = (this.s1 + s0) & 0xFFFFFFFFFFFFFFFFn;
    return Number(result) / 0xFFFFFFFFFFFFFFFF;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  nextBytes(count: number): Uint8Array {
    const bytes = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      bytes[i] = this.nextInt(256);
    }
    return bytes;
  }
}

// ============================================================================
// SIMPLE HASH FUNCTIONS
// ============================================================================

/**
 * FNV-1a Hash (fast, non-cryptographic)
 */
export function fnv1a(data: Uint8Array): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * MurmurHash3 (32-bit)
 */
export function murmur3(data: Uint8Array, seed = 0): number {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h1 = seed;
  const len = data.length;
  const blocks = Math.floor(len / 4);

  for (let i = 0; i < blocks; i++) {
    let k1 = data[i * 4] | (data[i * 4 + 1] << 8) |
             (data[i * 4 + 2] << 16) | (data[i * 4 + 3] << 24);
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  let k1 = 0;
  const tail = len & 3;
  if (tail >= 3) k1 ^= data[blocks * 4 + 2] << 16;
  if (tail >= 2) k1 ^= data[blocks * 4 + 1] << 8;
  if (tail >= 1) {
    k1 ^= data[blocks * 4];
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

// ============================================================================
// STATISTICAL TESTS
// ============================================================================

export const Stats = {
  /**
   * Calculate mean
   */
  mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  },

  /**
   * Calculate variance
   */
  variance(data: number[]): number {
    const m = this.mean(data);
    return data.reduce((sum, x) => sum + (x - m) ** 2, 0) / data.length;
  },

  /**
   * Calculate standard deviation
   */
  stdDev(data: number[]): number {
    return Math.sqrt(this.variance(data));
  },

  /**
   * Shannon entropy (bits per symbol)
   */
  entropy(data: Uint8Array): number {
    const freq = new Array(256).fill(0);
    for (const byte of data) freq[byte]++;

    let h = 0;
    for (const f of freq) {
      if (f > 0) {
        const p = f / data.length;
        h -= p * Math.log2(p);
      }
    }
    return h;
  },

  /**
   * Chi-square test for uniformity
   */
  chiSquare(data: number[], buckets = 10): { statistic: number; pass: boolean } {
    const counts = new Array(buckets).fill(0);
    const expected = data.length / buckets;

    for (const v of data) {
      const bucket = Math.min(Math.floor(v * buckets), buckets - 1);
      counts[bucket]++;
    }

    const statistic = counts.reduce((sum, c) => sum + (c - expected) ** 2 / expected, 0);
    const criticalValue = 16.92; // df=9, p=0.05

    return { statistic, pass: statistic < criticalValue };
  },

  /**
   * Runs test for independence
   */
  runsTest(data: number[]): { runs: number; expected: number; pass: boolean } {
    const median = [...data].sort((a, b) => a - b)[Math.floor(data.length / 2)];
    const signs = data.map(x => x >= median ? 1 : 0);

    let runs = 1;
    for (let i = 1; i < signs.length; i++) {
      if (signs[i] !== signs[i - 1]) runs++;
    }

    const n1 = signs.filter(s => s === 1).length;
    const n2 = signs.filter(s => s === 0).length;
    const expected = (2 * n1 * n2) / (n1 + n2) + 1;
    const variance = (2 * n1 * n2 * (2 * n1 * n2 - n1 - n2)) /
                     ((n1 + n2) ** 2 * (n1 + n2 - 1));
    const z = Math.abs(runs - expected) / Math.sqrt(variance);

    return { runs, expected, pass: z < 1.96 };
  },

  /**
   * Quick randomness quality assessment
   */
  assess(data: number[]): { score: number; quality: string } {
    const chi = this.chiSquare(data);
    const runs = this.runsTest(data);
    const bytes = new Uint8Array(data.map(d => Math.floor(d * 256)));
    const ent = this.entropy(bytes);

    let score = 0;
    if (chi.pass) score += 33;
    if (runs.pass) score += 33;
    if (ent > 7.5) score += 34;
    else if (ent > 6.5) score += 17;

    const quality = score >= 90 ? 'excellent' :
                    score >= 70 ? 'good' :
                    score >= 50 ? 'fair' : 'poor';

    return { score, quality };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert bytes to hex string
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert hex string to bytes
 */
export function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Secure comparison (constant time)
 */
export function secureCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Simple random bytes (picks best available)
 */
export function randomBytes(count: number): Uint8Array {
  // Try crypto API first
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(count);
    crypto.getRandomValues(bytes);
    return bytes;
  }
  // Fallback to ChaCha20
  return new ChaCha20().nextBytes(count);
}

/**
 * Random integer in range [0, max)
 */
export function randomInt(max: number): number {
  const bytes = randomBytes(4);
  const val = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  return val % max;
}

/**
 * Random float in [0, 1)
 */
export function random(): number {
  const bytes = randomBytes(4);
  return ((bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0) / 0xFFFFFFFF;
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Pick random element from array
 */
export function pick<T>(array: T[]): T {
  return array[randomInt(array.length)];
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Classes
  Entropy,
  LCG,
  MersenneTwister,
  ChaCha20,
  XorShift128Plus,
  // Hash functions
  fnv1a,
  murmur3,
  // Statistics
  Stats,
  // Utilities
  toHex,
  fromHex,
  secureCompare,
  randomBytes,
  randomInt,
  random,
  shuffle,
  pick
};
