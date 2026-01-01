/**
 * Module 2: One-Way Functions & Reversibility
 *
 * Demonstrates the difference between reversible mathematical operations
 * and cryptographic one-way functions
 */

import * as crypto from 'crypto';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';

/**
 * Reversible Mathematical Operations
 * These can always be inverted given the result
 */
export class ReversibleMath {
  /**
   * Addition (reversible with subtraction)
   */
  static add(a: number, b: number): { result: number; inverse: () => number } {
    const result = a + b;
    return {
      result,
      inverse: () => result - b
    };
  }

  /**
   * Multiplication (reversible with division, except for 0)
   */
  static multiply(a: number, b: number): { result: number; inverse: () => number } {
    const result = a * b;
    return {
      result,
      inverse: () => b !== 0 ? result / b : NaN
    };
  }

  /**
   * Exponentiation (reversible with logarithm)
   */
  static power(base: number, exp: number): { result: number; inverse: () => number } {
    const result = Math.pow(base, exp);
    return {
      result,
      inverse: () => Math.pow(result, 1 / exp)
    };
  }

  /**
   * XOR (self-inverse)
   */
  static xor(a: number, b: number): { result: number; inverse: () => number } {
    const result = a ^ b;
    return {
      result,
      inverse: () => result ^ b // XOR with same key reverses it
    };
  }

  /**
   * Bit rotation (reversible)
   */
  static rotateLeft(value: number, bits: number, width: number = 32): { result: number; inverse: () => number } {
    const mask = (1 << width) - 1;
    const result = ((value << bits) | (value >>> (width - bits))) & mask;
    return {
      result,
      inverse: () => ((result >>> bits) | (result << (width - bits))) & mask
    };
  }

  /**
   * Demonstrate reversibility
   */
  static demonstrateReversibility(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         REVERSIBLE OPERATIONS DEMONSTRATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const original = 42;

    // Addition
    const addOp = this.add(original, 17);
    lines.push(chalk.bold('  Addition:'));
    lines.push(`    ${original} + 17 = ${chalk.cyan(addOp.result.toString())}`);
    lines.push(`    Reverse: ${addOp.result} - 17 = ${chalk.green(addOp.inverse().toString())}`);
    lines.push(`    ${original === addOp.inverse() ? chalk.green('✓ Perfectly reversible') : chalk.red('✗ Error')}`);
    lines.push('');

    // Multiplication
    const mulOp = this.multiply(original, 7);
    lines.push(chalk.bold('  Multiplication:'));
    lines.push(`    ${original} × 7 = ${chalk.cyan(mulOp.result.toString())}`);
    lines.push(`    Reverse: ${mulOp.result} ÷ 7 = ${chalk.green(mulOp.inverse().toString())}`);
    lines.push(`    ${original === mulOp.inverse() ? chalk.green('✓ Perfectly reversible') : chalk.red('✗ Error')}`);
    lines.push('');

    // XOR
    const key = 0xABCD;
    const xorOp = this.xor(original, key);
    lines.push(chalk.bold('  XOR (Self-inverse):'));
    lines.push(`    ${original} ⊕ 0x${key.toString(16)} = ${chalk.cyan('0x' + xorOp.result.toString(16))}`);
    lines.push(`    Reverse: 0x${xorOp.result.toString(16)} ⊕ 0x${key.toString(16)} = ${chalk.green(xorOp.inverse().toString())}`);
    lines.push(`    ${original === xorOp.inverse() ? chalk.green('✓ Perfectly reversible') : chalk.red('✗ Error')}`);
    lines.push('');

    // Bit rotation
    const rotOp = this.rotateLeft(0b10110011, 3, 8);
    lines.push(chalk.bold('  Bit Rotation:'));
    lines.push(`    0b10110011 <<<3 = ${chalk.cyan('0b' + rotOp.result.toString(2).padStart(8, '0'))}`);
    lines.push(`    Reverse: 0b${rotOp.result.toString(2).padStart(8, '0')} >>>3 = ${chalk.green('0b' + rotOp.inverse().toString(2).padStart(8, '0'))}`);
    lines.push(`    ${0b10110011 === rotOp.inverse() ? chalk.green('✓ Perfectly reversible') : chalk.red('✗ Error')}`);

    lines.push('');
    lines.push(chalk.gray('  Key insight: All standard math operations have inverses.'));
    lines.push(chalk.gray('  Given the output and operation, we can always find the input.'));

    return lines.join('\n');
  }
}

/**
 * Cryptographic Hash Functions (One-Way)
 */
export class HashFunctions {
  /**
   * SHA-256 hash
   */
  static sha256(input: string | Buffer): Buffer {
    return crypto.createHash('sha256').update(input).digest();
  }

  /**
   * SHA-512 hash
   */
  static sha512(input: string | Buffer): Buffer {
    return crypto.createHash('sha512').update(input).digest();
  }

  /**
   * MD5 hash (weak, for demonstration)
   */
  static md5(input: string | Buffer): Buffer {
    return crypto.createHash('md5').update(input).digest();
  }

  /**
   * BLAKE2b hash
   */
  static blake2b(input: string | Buffer, length: number = 32): Buffer {
    return crypto.createHash('blake2b512').update(input).digest().slice(0, length);
  }

  /**
   * Demonstrate one-way property
   */
  static demonstrateOneWay(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('          ONE-WAY FUNCTIONS (HASH)'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const input = 'Hello, World!';
    const hash = this.sha256(input);

    lines.push(chalk.bold('  SHA-256 Hash:'));
    lines.push(`    Input:  "${chalk.cyan(input)}"`);
    lines.push(`    Output: ${chalk.yellow(hash.toString('hex'))}`);
    lines.push('');

    lines.push(chalk.bold('  Properties of One-Way Functions:'));
    lines.push(`    ${chalk.green('1.')} Easy to compute: Input → Hash (microseconds)`);
    lines.push(`    ${chalk.red('2.')} Impossible to reverse: Hash → Input (?)`);
    lines.push(`    ${chalk.yellow('3.')} Collision resistant: Hard to find x,y where H(x)=H(y)`);
    lines.push('');

    // Show multiple inputs with same starting characters
    const similar = ['Hello, World!', 'Hello, World?', 'Hello, World.'];
    lines.push(chalk.bold('  Similar inputs, completely different outputs:'));
    similar.forEach(s => {
      const h = this.sha256(s).toString('hex').slice(0, 16);
      lines.push(`    "${chalk.cyan(s)}" → ${chalk.yellow(h)}...`);
    });

    lines.push('');
    lines.push(chalk.red.bold('  ⚠ The only way to "reverse" a hash is brute force!'));
    lines.push(chalk.gray('    Try every possible input until one matches.'));

    return lines.join('\n');
  }
}

/**
 * Rainbow Table Attack Simulator
 */
export class RainbowTableAttack {
  private table: Map<string, string>;
  private hashFunction: (input: string) => string;

  constructor(hashFn: (input: string) => string = (s) => HashFunctions.sha256(s).toString('hex')) {
    this.table = new Map();
    this.hashFunction = hashFn;
  }

  /**
   * Precompute hashes for a wordlist
   */
  buildTable(wordlist: string[]): { time: number; entries: number } {
    const start = performance.now();

    wordlist.forEach(word => {
      const hash = this.hashFunction(word);
      this.table.set(hash, word);
    });

    return {
      time: performance.now() - start,
      entries: this.table.size
    };
  }

  /**
   * Attempt to crack a hash
   */
  lookup(hash: string): { found: boolean; plaintext?: string; time: number } {
    const start = performance.now();
    const result = this.table.get(hash);
    return {
      found: !!result,
      plaintext: result,
      time: performance.now() - start
    };
  }

  /**
   * Generate common password wordlist
   */
  static generateWordlist(): string[] {
    const words: string[] = [];

    // Common passwords
    const common = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome',
                    'monkey', 'dragon', 'master', 'hello', 'love', 'secret'];
    words.push(...common);

    // Numeric variations
    for (let i = 0; i <= 9999; i++) {
      words.push(i.toString().padStart(4, '0'));
    }

    // Common words with numbers
    common.forEach(word => {
      for (let i = 0; i <= 99; i++) {
        words.push(word + i);
        words.push(i + word);
      }
    });

    // Names (sample)
    const names = ['john', 'jane', 'bob', 'alice', 'charlie', 'david', 'emma'];
    names.forEach(name => {
      words.push(name);
      words.push(name.charAt(0).toUpperCase() + name.slice(1));
      for (let year = 1980; year <= 2024; year++) {
        words.push(name + year);
      }
    });

    return words;
  }

  /**
   * Demonstrate rainbow table attack
   */
  static async demonstrate(): Promise<string> {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         RAINBOW TABLE ATTACK SIMULATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const attack = new RainbowTableAttack();
    const wordlist = this.generateWordlist();

    lines.push(chalk.bold('  Phase 1: Building Rainbow Table'));
    lines.push(`    Wordlist size: ${chalk.cyan(wordlist.length.toLocaleString())} entries`);

    const buildResult = attack.buildTable(wordlist);
    lines.push(`    Build time:    ${chalk.cyan(buildResult.time.toFixed(2))} ms`);
    lines.push(`    Table entries: ${chalk.cyan(buildResult.entries.toLocaleString())}`);
    lines.push('');

    // Test some hashes
    lines.push(chalk.bold('  Phase 2: Cracking Hashes'));

    const targets = [
      { password: 'password123', expected: true },
      { password: 'alice2000', expected: true },
      { password: '0042', expected: true },
      { password: 'xK9#mP2$vL7!', expected: false } // Complex password
    ];

    for (const target of targets) {
      const hash = HashFunctions.sha256(target.password).toString('hex');
      const result = attack.lookup(hash);

      if (result.found) {
        lines.push(`    ${chalk.red('CRACKED!')} "${target.password}"`);
        lines.push(`      Hash: ${chalk.gray(hash.slice(0, 32))}...`);
        lines.push(`      Time: ${chalk.cyan(result.time.toFixed(3))} ms`);
      } else {
        lines.push(`    ${chalk.green('SECURE')} (not in table)`);
        lines.push(`      Hash: ${chalk.gray(hash.slice(0, 32))}...`);
        lines.push(`      Password complexity prevented lookup`);
      }
      lines.push('');
    }

    lines.push(chalk.bold('  Defense Mechanisms:'));
    lines.push(`    ${chalk.green('1.')} Use salted hashes (unique salt per password)`);
    lines.push(`    ${chalk.green('2.')} Use slow hash functions (bcrypt, Argon2)`);
    lines.push(`    ${chalk.green('3.')} Enforce strong password policies`);
    lines.push(`    ${chalk.green('4.')} Use key stretching (PBKDF2)`);

    return lines.join('\n');
  }
}

/**
 * Avalanche Effect Demonstration
 */
export class AvalancheEffect {
  /**
   * Measure avalanche effect - how one bit change affects output
   */
  static measure(input: Buffer, hashFn: (b: Buffer) => Buffer): {
    original: Buffer;
    flipped: Buffer[];
    changedBits: number[];
    averageChange: number;
  } {
    const original = hashFn(input);
    const flipped: Buffer[] = [];
    const changedBits: number[] = [];

    // Flip each bit in the input
    for (let byteIdx = 0; byteIdx < input.length; byteIdx++) {
      for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
        const modified = Buffer.from(input);
        modified[byteIdx] ^= (1 << bitIdx);

        const newHash = hashFn(modified);
        flipped.push(newHash);

        // Count differing bits
        let diff = 0;
        for (let i = 0; i < original.length; i++) {
          let xor = original[i] ^ newHash[i];
          while (xor) {
            diff += xor & 1;
            xor >>>= 1;
          }
        }
        changedBits.push(diff);
      }
    }

    const averageChange = changedBits.reduce((a, b) => a + b, 0) / changedBits.length;

    return { original, flipped, changedBits, averageChange };
  }

  /**
   * Visualize the avalanche effect
   */
  static visualize(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         AVALANCHE EFFECT VISUALIZATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const input = Buffer.from('Hello');
    const hashFn = (b: Buffer) => HashFunctions.sha256(b);

    lines.push(chalk.bold('  Original Input: ') + chalk.cyan('"Hello"'));
    lines.push(chalk.bold('  Original Hash:  ') + chalk.yellow(hashFn(input).toString('hex').slice(0, 32)) + '...');
    lines.push('');

    // Show bit flip effects
    lines.push(chalk.bold('  Effect of flipping single bits:'));
    lines.push('');

    const inputBinary = input.toString('hex').split('').map(h =>
      parseInt(h, 16).toString(2).padStart(4, '0')
    ).join('');

    // Flip first few bits and show results
    for (let bit = 0; bit < 8; bit++) {
      const modified = Buffer.from(input);
      const byteIdx = 0;
      modified[byteIdx] ^= (1 << bit);

      const originalHash = hashFn(input);
      const modifiedHash = hashFn(modified);

      // Count changed bits in hash
      let changedBits = 0;
      for (let i = 0; i < originalHash.length; i++) {
        let xor = originalHash[i] ^ modifiedHash[i];
        while (xor) {
          changedBits += xor & 1;
          xor >>>= 1;
        }
      }

      const changePercent = (changedBits / (originalHash.length * 8)) * 100;

      // Visual representation
      const inputChar = String.fromCharCode(input[0]);
      const modChar = String.fromCharCode(modified[0]);

      lines.push(`    Bit ${bit}: '${chalk.cyan(inputChar)}' → '${chalk.yellow(modChar)}'`);
      lines.push(`           Hash changed: ${chalk.green(changedBits.toString())} bits (${changePercent.toFixed(1)}%)`);

      // Mini visualization of hash change
      let hashViz = '           ';
      for (let i = 0; i < 16; i++) {
        if (originalHash[i] !== modifiedHash[i]) {
          hashViz += chalk.red('█');
        } else {
          hashViz += chalk.gray('░');
        }
      }
      lines.push(hashViz + ' (first 16 bytes)');
      lines.push('');
    }

    lines.push(chalk.bold('  Statistical Analysis:'));
    const result = this.measure(input, hashFn);
    const totalBits = 256;
    const expectedChange = totalBits / 2;
    lines.push(`    Average bits changed: ${chalk.cyan(result.averageChange.toFixed(1))} / ${totalBits}`);
    lines.push(`    Expected (ideal):     ${chalk.green(expectedChange.toString())} / ${totalBits} (50%)`);
    lines.push(`    Deviation:            ${chalk.cyan(Math.abs(result.averageChange - expectedChange).toFixed(1))} bits`);
    lines.push('');

    if (Math.abs(result.averageChange - expectedChange) < 10) {
      lines.push(chalk.green('  ✓ Excellent avalanche effect - good hash function'));
    } else {
      lines.push(chalk.yellow('  ◐ Moderate avalanche effect'));
    }

    return lines.join('\n');
  }
}

/**
 * Timing Comparison: Reversible vs One-Way
 */
export class TimingComparison {
  /**
   * Compare time to compute forward vs reverse
   */
  static async compare(): Promise<string> {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         TIMING: FORWARD vs REVERSE'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Reversible operation timing
    lines.push(chalk.bold('  Reversible Operations:'));
    lines.push(chalk.gray('  ' + '─'.repeat(45)));

    const iterations = 1000000;

    // Multiplication
    let start = performance.now();
    let result = 1;
    for (let i = 0; i < iterations; i++) {
      result = (result * 7) % 1000000007;
    }
    let forwardTime = performance.now() - start;

    start = performance.now();
    for (let i = 0; i < iterations; i++) {
      result = (result / 7);
    }
    let reverseTime = performance.now() - start;

    lines.push(`    Multiplication (${(iterations/1e6).toFixed(1)}M ops):`);
    lines.push(`      Forward:  ${chalk.green(forwardTime.toFixed(2))} ms`);
    lines.push(`      Reverse:  ${chalk.green(reverseTime.toFixed(2))} ms`);
    lines.push(`      Ratio:    ${chalk.cyan((reverseTime / forwardTime).toFixed(2))}x`);
    lines.push('');

    // Hash function timing
    lines.push(chalk.bold('  Hash Functions (One-Way):'));
    lines.push(chalk.gray('  ' + '─'.repeat(45)));

    const hashIterations = 100000;

    start = performance.now();
    for (let i = 0; i < hashIterations; i++) {
      HashFunctions.sha256(Buffer.from(`test${i}`));
    }
    forwardTime = performance.now() - start;

    // "Reverse" would require brute force
    // We simulate finding a 4-character preimage
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const target = HashFunctions.sha256(Buffer.from('test')).toString('hex');
    let found = false;
    let attempts = 0;

    start = performance.now();
    outer: for (let a = 0; a < charset.length; a++) {
      for (let b = 0; b < charset.length; b++) {
        for (let c = 0; c < charset.length; c++) {
          for (let d = 0; d < charset.length; d++) {
            attempts++;
            const candidate = charset[a] + charset[b] + charset[c] + charset[d];
            if (HashFunctions.sha256(Buffer.from(candidate)).toString('hex') === target) {
              found = true;
              break outer;
            }
            if (attempts > 100000) break outer; // Limit for demo
          }
        }
      }
    }
    reverseTime = performance.now() - start;

    lines.push(`    SHA-256 (${(hashIterations/1e3).toFixed(0)}K hashes):`);
    lines.push(`      Forward:  ${chalk.green(forwardTime.toFixed(2))} ms`);
    lines.push(`      Reverse:  ${found ?
      chalk.yellow(`${reverseTime.toFixed(2)} ms (4-char only!)`) :
      chalk.red(`>${reverseTime.toFixed(2)} ms (gave up after ${attempts.toLocaleString()} attempts)`)}`);
    lines.push('');

    // Estimated time for real passwords
    lines.push(chalk.bold('  Estimated Brute Force Time (SHA-256):'));
    lines.push(chalk.gray('  ' + '─'.repeat(45)));

    const hashesPerSecond = hashIterations / (forwardTime / 1000);
    const charsets = [
      { name: '4 digits', space: Math.pow(10, 4) },
      { name: '6 lowercase', space: Math.pow(26, 6) },
      { name: '8 alphanumeric', space: Math.pow(62, 8) },
      { name: '12 all chars', space: Math.pow(94, 12) },
      { name: '256-bit key', space: Math.pow(2, 256) }
    ];

    charsets.forEach(cs => {
      const seconds = cs.space / hashesPerSecond;
      lines.push(`    ${cs.name.padEnd(15)}: ${Visualization.timeEstimate(seconds)}`);
    });

    lines.push('');
    lines.push(chalk.bold('  Conclusion:'));
    lines.push(chalk.gray('  ' + '─'.repeat(45)));
    lines.push(`    Forward computation:  ${chalk.green('O(1)')} - constant time`);
    lines.push(`    Reverse computation:  ${chalk.red('O(2^n)')} - exponential in key size`);
    lines.push('');
    lines.push(chalk.green('    This asymmetry is the foundation of modern cryptography!'));

    return lines.join('\n');
  }
}

export default {
  ReversibleMath,
  HashFunctions,
  RainbowTableAttack,
  AvalancheEffect,
  TimingComparison
};
