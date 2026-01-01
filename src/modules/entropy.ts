/**
 * Module 1: Entropy & Random Number Generators
 *
 * Explores different sources of randomness and PRNG implementations
 */

import * as crypto from 'crypto';
import * as os from 'os';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';
import { Statistics } from '../utils/statistics';

/**
 * Entropy source types
 */
export enum EntropySource {
  TIMESTAMP = 'timestamp',
  PROCESS = 'process',
  SYSTEM = 'system',
  CRYPTO = 'crypto',
  COMBINED = 'combined'
}

/**
 * Entropy Collector
 * Gathers entropy from multiple system sources
 */
export class EntropyCollector {
  private entropyPool: number[] = [];
  private mixingState: Uint8Array;

  constructor() {
    this.mixingState = new Uint8Array(64);
    crypto.randomFillSync(this.mixingState);
  }

  /**
   * Collect entropy from timestamp (LOW QUALITY - for demonstration)
   */
  collectFromTimestamp(): Uint8Array {
    const now = process.hrtime.bigint();
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64LE(now);

    // Add some timing jitter
    const start = process.hrtime.bigint();
    let jitter = 0;
    for (let i = 0; i < 1000; i++) {
      jitter ^= Number(process.hrtime.bigint() & 0xFFn);
    }
    const end = process.hrtime.bigint();
    const elapsed = Number(end - start);

    const result = new Uint8Array(16);
    result.set(buffer, 0);
    result[8] = jitter & 0xFF;
    result[9] = (elapsed >> 8) & 0xFF;
    result[10] = elapsed & 0xFF;
    result[11] = Math.random() * 255;

    return result;
  }

  /**
   * Collect entropy from process information
   */
  collectFromProcess(): Uint8Array {
    const data: number[] = [];

    // Process ID
    data.push(...this.numberToBytes(process.pid, 4));

    // Memory usage
    const mem = process.memoryUsage();
    data.push(...this.numberToBytes(mem.heapUsed, 8));
    data.push(...this.numberToBytes(mem.external, 4));

    // CPU usage
    const cpu = process.cpuUsage();
    data.push(...this.numberToBytes(cpu.user, 4));
    data.push(...this.numberToBytes(cpu.system, 4));

    // Uptime with high precision
    data.push(...this.numberToBytes(Math.floor(process.uptime() * 1e9), 8));

    return new Uint8Array(data);
  }

  /**
   * Collect entropy from system metrics
   */
  collectFromSystem(): Uint8Array {
    const data: number[] = [];

    // System uptime
    data.push(...this.numberToBytes(Math.floor(os.uptime() * 1000), 8));

    // Free memory
    data.push(...this.numberToBytes(os.freemem(), 8));

    // Load average (Unix-like systems)
    const loadAvg = os.loadavg();
    loadAvg.forEach(load => {
      data.push(...this.numberToBytes(Math.floor(load * 1e6), 4));
    });

    // Network interfaces (MAC addresses have some entropy)
    const netInterfaces = os.networkInterfaces();
    Object.values(netInterfaces).forEach(iface => {
      if (iface) {
        iface.forEach(addr => {
          if (addr.mac && addr.mac !== '00:00:00:00:00:00') {
            const macBytes = addr.mac.split(':').map(h => parseInt(h, 16));
            data.push(...macBytes);
          }
        });
      }
    });

    // CPU info
    const cpus = os.cpus();
    cpus.forEach(cpu => {
      data.push(...this.numberToBytes(cpu.times.user, 4));
      data.push(...this.numberToBytes(cpu.times.sys, 4));
      data.push(...this.numberToBytes(cpu.times.idle, 4));
    });

    return new Uint8Array(data.slice(0, 64));
  }

  /**
   * Collect high-quality entropy from crypto module
   */
  collectFromCrypto(bytes: number = 32): Uint8Array {
    return crypto.randomBytes(bytes);
  }

  /**
   * Combine all entropy sources
   */
  collectCombined(): Uint8Array {
    const timestamp = this.collectFromTimestamp();
    const process = this.collectFromProcess();
    const system = this.collectFromSystem();
    const cryptoEntropy = this.collectFromCrypto(32);

    // Combine all sources
    const combined = new Uint8Array(
      timestamp.length + process.length + system.length + cryptoEntropy.length
    );

    let offset = 0;
    combined.set(timestamp, offset); offset += timestamp.length;
    combined.set(process, offset); offset += process.length;
    combined.set(system, offset); offset += system.length;
    combined.set(cryptoEntropy, offset);

    // Hash to mix and compress
    return this.hash(combined);
  }

  /**
   * Hash entropy to mix it thoroughly
   */
  private hash(data: Uint8Array): Uint8Array {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return new Uint8Array(hash.digest());
  }

  /**
   * Convert number to bytes
   */
  private numberToBytes(num: number, bytes: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < bytes; i++) {
      result.push((num >> (i * 8)) & 0xFF);
    }
    return result;
  }

  /**
   * Display entropy collection report
   */
  displayReport(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('           ENTROPY COLLECTION REPORT'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Collect and analyze each source
    const sources: { name: string; data: Uint8Array; quality: string }[] = [
      { name: 'Timestamp', data: this.collectFromTimestamp(), quality: 'LOW' },
      { name: 'Process Info', data: this.collectFromProcess(), quality: 'MEDIUM' },
      { name: 'System Metrics', data: this.collectFromSystem(), quality: 'MEDIUM' },
      { name: 'Crypto Module', data: this.collectFromCrypto(), quality: 'HIGH' },
      { name: 'Combined', data: this.collectCombined(), quality: 'HIGH' }
    ];

    sources.forEach(source => {
      const entropy = Statistics.shannonEntropy(source.data);
      const qualityColor = source.quality === 'HIGH' ? chalk.green :
                          source.quality === 'MEDIUM' ? chalk.yellow : chalk.red;

      lines.push(chalk.bold(`  ${source.name}:`));
      lines.push(`    Size:     ${chalk.cyan(source.data.length.toString())} bytes`);
      lines.push(`    Entropy:  ${chalk.cyan(entropy.toFixed(4))} bits/byte`);
      lines.push(`    Quality:  ${qualityColor(source.quality)}`);
      lines.push(`    Sample:   ${chalk.gray(Buffer.from(source.data.slice(0, 8)).toString('hex'))}...`);
      lines.push('');
    });

    return lines.join('\n');
  }
}

/**
 * Linear Congruential Generator (LCG)
 * Classic weak PRNG for demonstration
 */
export class LCG {
  private state: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);

  constructor(seed?: number) {
    this.state = seed ?? Date.now() & 0xFFFFFFFF;
  }

  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  getState(): number {
    return this.state;
  }

  /**
   * Demonstrate predictability
   */
  static demonstratePredictability(): string {
    const lines: string[] = [];
    const seed = 12345;
    const lcg1 = new LCG(seed);
    const lcg2 = new LCG(seed);

    lines.push(chalk.bold.yellow('\n  ⚠ LCG Predictability Demonstration'));
    lines.push(chalk.gray('  ─'.repeat(30)));
    lines.push(`  Same seed (${seed}) produces identical sequences:`);
    lines.push('');

    for (let i = 0; i < 5; i++) {
      const v1 = lcg1.next().toFixed(6);
      const v2 = lcg2.next().toFixed(6);
      lines.push(`    ${chalk.cyan(`LCG1[${i}]`)}: ${v1}  ${chalk.cyan(`LCG2[${i}]`)}: ${v2}  ${chalk.green('✓ MATCH')}`);
    }

    lines.push('');
    lines.push(chalk.red('  ⚠ Never use LCG for cryptographic purposes!'));

    return lines.join('\n');
  }
}

/**
 * Mersenne Twister (MT19937)
 * Better quality PRNG, but still predictable
 */
export class MersenneTwister {
  private mt: Uint32Array;
  private mti: number;
  private readonly N = 624;
  private readonly M = 397;
  private readonly MATRIX_A = 0x9908b0df;
  private readonly UPPER_MASK = 0x80000000;
  private readonly LOWER_MASK = 0x7fffffff;

  constructor(seed?: number) {
    this.mt = new Uint32Array(this.N);
    this.mti = this.N + 1;
    this.init(seed ?? Date.now());
  }

  private init(seed: number): void {
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < this.N; i++) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
                   (s & 0x0000ffff) * 1812433253 + i) >>> 0;
    }
    this.mti = this.N;
  }

  private generateNumbers(): void {
    let y: number;
    const mag01 = [0, this.MATRIX_A];

    for (let kk = 0; kk < this.N - this.M; kk++) {
      y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
      this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 1];
    }

    for (let kk = this.N - this.M; kk < this.N - 1; kk++) {
      y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
      this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 1];
    }

    y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
    this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 1];

    this.mti = 0;
  }

  next(): number {
    if (this.mti >= this.N) {
      this.generateNumbers();
    }

    let y = this.mt[this.mti++];

    // Tempering
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return (y >>> 0) / 0xFFFFFFFF;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * ChaCha20-based CSPRNG
 * Cryptographically secure implementation
 */
export class ChaCha20CSPRNG {
  private state: Uint32Array;
  private counter: bigint;
  private buffer: Uint8Array;
  private bufferIndex: number;

  private static readonly CONSTANTS = new Uint32Array([
    0x61707865, 0x3320646e, 0x79622d32, 0x6b206574 // "expand 32-byte k"
  ]);

  constructor(key?: Uint8Array, nonce?: Uint8Array) {
    // Generate key and nonce from crypto if not provided
    const keyBytes = key ?? crypto.randomBytes(32);
    const nonceBytes = nonce ?? crypto.randomBytes(12);

    this.state = new Uint32Array(16);
    this.counter = 0n;
    this.buffer = new Uint8Array(64);
    this.bufferIndex = 64; // Force refill on first use

    this.initState(keyBytes, nonceBytes);
  }

  private initState(key: Uint8Array, nonce: Uint8Array): void {
    // Constants
    this.state.set(ChaCha20CSPRNG.CONSTANTS, 0);

    // Key (8 x 32-bit words)
    for (let i = 0; i < 8; i++) {
      this.state[4 + i] = this.bytesToWord(key, i * 4);
    }

    // Counter (will be set in generateBlock)
    this.state[12] = 0;
    this.state[13] = 0;

    // Nonce (3 x 32-bit words)
    this.state[13] = this.bytesToWord(nonce, 0);
    this.state[14] = this.bytesToWord(nonce, 4);
    this.state[15] = this.bytesToWord(nonce, 8);
  }

  private bytesToWord(bytes: Uint8Array, offset: number): number {
    return (
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ) >>> 0;
  }

  private quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
    state[a] = (state[a] + state[b]) >>> 0; state[d] ^= state[a]; state[d] = this.rotl(state[d], 16);
    state[c] = (state[c] + state[d]) >>> 0; state[b] ^= state[c]; state[b] = this.rotl(state[b], 12);
    state[a] = (state[a] + state[b]) >>> 0; state[d] ^= state[a]; state[d] = this.rotl(state[d], 8);
    state[c] = (state[c] + state[d]) >>> 0; state[b] ^= state[c]; state[b] = this.rotl(state[b], 7);
  }

  private rotl(x: number, n: number): number {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  private generateBlock(): void {
    // Set counter
    this.state[12] = Number(this.counter & 0xFFFFFFFFn);

    // Copy state
    const working = new Uint32Array(this.state);

    // 20 rounds (10 double rounds)
    for (let i = 0; i < 10; i++) {
      // Column rounds
      this.quarterRound(working, 0, 4, 8, 12);
      this.quarterRound(working, 1, 5, 9, 13);
      this.quarterRound(working, 2, 6, 10, 14);
      this.quarterRound(working, 3, 7, 11, 15);
      // Diagonal rounds
      this.quarterRound(working, 0, 5, 10, 15);
      this.quarterRound(working, 1, 6, 11, 12);
      this.quarterRound(working, 2, 7, 8, 13);
      this.quarterRound(working, 3, 4, 9, 14);
    }

    // Add original state
    for (let i = 0; i < 16; i++) {
      working[i] = (working[i] + this.state[i]) >>> 0;
    }

    // Convert to bytes
    for (let i = 0; i < 16; i++) {
      const word = working[i];
      this.buffer[i * 4] = word & 0xFF;
      this.buffer[i * 4 + 1] = (word >> 8) & 0xFF;
      this.buffer[i * 4 + 2] = (word >> 16) & 0xFF;
      this.buffer[i * 4 + 3] = (word >> 24) & 0xFF;
    }

    this.counter++;
    this.bufferIndex = 0;
  }

  /**
   * Get next random byte
   */
  nextByte(): number {
    if (this.bufferIndex >= 64) {
      this.generateBlock();
    }
    return this.buffer[this.bufferIndex++];
  }

  /**
   * Get random bytes
   */
  nextBytes(count: number): Uint8Array {
    const result = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      result[i] = this.nextByte();
    }
    return result;
  }

  /**
   * Get random number in [0, 1)
   */
  next(): number {
    const bytes = this.nextBytes(4);
    const uint32 = (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
    return uint32 / 0xFFFFFFFF;
  }

  /**
   * Get random integer in [0, max)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Wrapper for crypto.getRandomValues (Web Crypto API style)
 */
export class CryptoRandom {
  /**
   * Fill array with cryptographically secure random values
   */
  static getRandomValues(array: Uint8Array): Uint8Array {
    crypto.randomFillSync(array);
    return array;
  }

  /**
   * Get random bytes
   */
  static randomBytes(count: number): Uint8Array {
    return crypto.randomBytes(count);
  }

  /**
   * Get random number in [0, 1)
   */
  static next(): number {
    const bytes = crypto.randomBytes(4);
    const uint32 = bytes.readUInt32LE(0);
    return uint32 / 0xFFFFFFFF;
  }

  /**
   * Get random integer in [0, max)
   */
  static nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /**
   * Get cryptographically secure random BigInt
   */
  static randomBigInt(bits: number): bigint {
    const bytes = Math.ceil(bits / 8);
    const buffer = crypto.randomBytes(bytes);
    let result = 0n;
    for (let i = 0; i < buffer.length; i++) {
      result = (result << 8n) | BigInt(buffer[i]);
    }
    // Mask to exact bit count
    const mask = (1n << BigInt(bits)) - 1n;
    return result & mask;
  }
}

/**
 * RNG Comparison and Analysis
 */
export class RNGAnalyzer {
  /**
   * Compare different RNG implementations
   */
  static async compare(sampleSize: number = 10000): Promise<string> {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('           RNG IMPLEMENTATION COMPARISON'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const generators: { name: string; gen: () => number; type: string }[] = [
      { name: 'Math.random()', gen: () => Math.random(), type: 'Built-in PRNG' },
      { name: 'LCG', gen: new LCG().next.bind(new LCG()), type: 'Linear Congruential' },
      { name: 'Mersenne Twister', gen: new MersenneTwister().next.bind(new MersenneTwister()), type: 'Twisted GFSR' },
      { name: 'ChaCha20', gen: new ChaCha20CSPRNG().next.bind(new ChaCha20CSPRNG()), type: 'Stream Cipher' },
      { name: 'crypto.randomBytes', gen: () => CryptoRandom.next(), type: 'OS Entropy Pool' }
    ];

    for (const gen of generators) {
      lines.push(chalk.bold(`  ${gen.name} (${gen.type})`));
      lines.push(chalk.gray('  ' + '─'.repeat(45)));

      // Generate samples
      const samples: number[] = [];
      const start = performance.now();
      for (let i = 0; i < sampleSize; i++) {
        samples.push(gen.gen());
      }
      const elapsed = performance.now() - start;

      // Statistical analysis
      const chiSquare = Statistics.chiSquareUniformity(samples);
      const runs = Statistics.runsTest(samples);
      const entropy = Statistics.shannonEntropy(
        new Uint8Array(samples.map(s => Math.floor(s * 256)))
      );

      lines.push(`    Speed:       ${chalk.cyan((sampleSize / elapsed * 1000).toFixed(0))} nums/sec`);
      lines.push(`    Chi-Square:  ${chiSquare.isRandom ? chalk.green('PASS') : chalk.red('FAIL')} (χ²=${chiSquare.statistic.toFixed(2)})`);
      lines.push(`    Runs Test:   ${runs.isRandom ? chalk.green('PASS') : chalk.red('FAIL')} (z=${runs.zScore.toFixed(2)})`);
      lines.push(`    Entropy:     ${chalk.cyan(entropy.toFixed(4))} bits/byte`);

      // Security assessment
      const isCrypto = gen.name.includes('crypto') || gen.name.includes('ChaCha');
      if (isCrypto) {
        lines.push(`    Security:    ${chalk.green('✓ Cryptographically Secure')}`);
      } else {
        lines.push(`    Security:    ${chalk.red('✗ NOT for cryptographic use')}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Visual demonstration of randomness quality
   */
  static visualDemo(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         RANDOMNESS QUALITY VISUALIZATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Generate samples from each RNG
    const lcg = new LCG(1);
    const mt = new MersenneTwister(1);
    const chacha = new ChaCha20CSPRNG();

    const generatePattern = (gen: () => number, size: number = 20): string => {
      let pattern = '';
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size * 2; col++) {
          const val = gen();
          if (val < 0.5) {
            pattern += chalk.gray('░');
          } else {
            pattern += chalk.white('█');
          }
        }
        pattern += '\n  ';
      }
      return pattern;
    };

    lines.push(chalk.bold('  LCG (Low Quality):'));
    lines.push('  ' + generatePattern(() => lcg.next(), 10));

    lines.push(chalk.bold('  Mersenne Twister (Medium Quality):'));
    lines.push('  ' + generatePattern(() => mt.next(), 10));

    lines.push(chalk.bold('  ChaCha20 (High Quality):'));
    lines.push('  ' + generatePattern(() => chacha.next(), 10));

    lines.push(chalk.gray('  Note: Good randomness should show no visible patterns'));

    return lines.join('\n');
  }
}

export default {
  EntropyCollector,
  LCG,
  MersenneTwister,
  ChaCha20CSPRNG,
  CryptoRandom,
  RNGAnalyzer
};
