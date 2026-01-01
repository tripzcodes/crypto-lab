/**
 * Module 4: Provable Security Demonstrations
 *
 * Implements cryptographic primitives with provable security properties
 */

import * as crypto from 'crypto';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';
import { CryptoRandom } from './entropy';

/**
 * Modular arithmetic utilities for cryptography
 */
export class ModularMath {
  /**
   * Modular exponentiation: base^exp mod mod
   * Uses square-and-multiply for efficiency
   */
  static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    base = base % mod;

    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod;
      }
      exp = exp >> 1n;
      base = (base * base) % mod;
    }

    return result;
  }

  /**
   * Extended Euclidean Algorithm
   * Returns [gcd, x, y] where ax + by = gcd
   */
  static extendedGcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (a === 0n) {
      return [b, 0n, 1n];
    }

    const [gcd, x1, y1] = this.extendedGcd(b % a, a);
    const x = y1 - (b / a) * x1;
    const y = x1;

    return [gcd, x, y];
  }

  /**
   * Modular multiplicative inverse
   */
  static modInverse(a: bigint, mod: bigint): bigint {
    const [gcd, x] = this.extendedGcd(a % mod, mod);
    if (gcd !== 1n) {
      throw new Error('Modular inverse does not exist');
    }
    return ((x % mod) + mod) % mod;
  }

  /**
   * Check if number is probably prime (Miller-Rabin)
   */
  static isProbablePrime(n: bigint, k: number = 10): boolean {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;

    // Write n-1 as 2^r * d
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      r++;
      d /= 2n;
    }

    // Witness loop
    witnessLoop: for (let i = 0; i < k; i++) {
      // Random a in [2, n-2]
      const bytes = Math.ceil(Number(n.toString(2).length) / 8);
      let a = CryptoRandom.randomBigInt(bytes * 8) % (n - 4n) + 2n;

      let x = this.modPow(a, d, n);

      if (x === 1n || x === n - 1n) continue;

      for (let j = 0n; j < r - 1n; j++) {
        x = this.modPow(x, 2n, n);
        if (x === n - 1n) continue witnessLoop;
      }

      return false;
    }

    return true;
  }

  /**
   * Generate a random prime of specified bit length
   */
  static generatePrime(bits: number): bigint {
    while (true) {
      let candidate = CryptoRandom.randomBigInt(bits);
      // Set MSB to ensure bit length
      candidate |= (1n << BigInt(bits - 1));
      // Set LSB to ensure odd
      candidate |= 1n;

      if (this.isProbablePrime(candidate)) {
        return candidate;
      }
    }
  }
}

/**
 * Diffie-Hellman Key Exchange
 */
export class DiffieHellman {
  private p: bigint; // Prime modulus
  private g: bigint; // Generator
  private privateKey: bigint;
  public publicKey: bigint;

  constructor(primeBits: number = 64) {
    // For demonstration, use smaller primes
    // In production, use 2048+ bits
    this.p = ModularMath.generatePrime(primeBits);

    // Find a generator (simplified - just use 2 if it works)
    this.g = 2n;

    // Generate private key
    this.privateKey = CryptoRandom.randomBigInt(primeBits - 1);

    // Compute public key: g^privateKey mod p
    this.publicKey = ModularMath.modPow(this.g, this.privateKey, this.p);
  }

  /**
   * Compute shared secret from other party's public key
   */
  computeSharedSecret(otherPublicKey: bigint): bigint {
    return ModularMath.modPow(otherPublicKey, this.privateKey, this.p);
  }

  /**
   * Get parameters
   */
  getParams(): { p: bigint; g: bigint } {
    return { p: this.p, g: this.g };
  }

  /**
   * Demonstrate DH key exchange
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         DIFFIE-HELLMAN KEY EXCHANGE'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Scenario:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Alice and Bob want to establish a shared secret');
    lines.push('    over an insecure channel. Eve is listening.');
    lines.push('');

    // Create two parties
    const primeBits = 48; // Small for demo
    const alice = new DiffieHellman(primeBits);
    const { p, g } = alice.getParams();

    // Bob uses same p and g
    const bobPrivate = CryptoRandom.randomBigInt(primeBits - 1);
    const bobPublic = ModularMath.modPow(g, bobPrivate, p);

    lines.push(chalk.bold('  Public Parameters (known to everyone):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Prime p: ${chalk.cyan(p.toString())}`);
    lines.push(`    Generator g: ${chalk.cyan(g.toString())}`);
    lines.push('');

    lines.push(chalk.bold('  Step 1: Generate Private Keys'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Alice's private key (a): ${chalk.red('[SECRET]')}`);
    lines.push(`    Bob's private key (b):   ${chalk.red('[SECRET]')}`);
    lines.push('');

    lines.push(chalk.bold('  Step 2: Compute Public Keys'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Alice: A = g^a mod p = ${chalk.yellow(alice.publicKey.toString())}`);
    lines.push(`    Bob:   B = g^b mod p = ${chalk.yellow(bobPublic.toString())}`);
    lines.push('');
    lines.push(chalk.gray('    → Public keys are exchanged over the insecure channel'));
    lines.push(chalk.gray('    → Eve can see both A and B'));
    lines.push('');

    lines.push(chalk.bold('  Step 3: Compute Shared Secret'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const aliceSecret = alice.computeSharedSecret(bobPublic);
    const bobSecret = ModularMath.modPow(alice.publicKey, bobPrivate, p);

    lines.push(`    Alice computes: B^a mod p = ${chalk.green(aliceSecret.toString())}`);
    lines.push(`    Bob computes:   A^b mod p = ${chalk.green(bobSecret.toString())}`);
    lines.push('');

    if (aliceSecret === bobSecret) {
      lines.push(`    ${chalk.green('✓ SHARED SECRET ESTABLISHED!')}`);
      lines.push(`    Both computed: ${chalk.green(aliceSecret.toString())}`);
    }

    lines.push('');
    lines.push(chalk.bold('  Why Eve Cannot Compute the Secret:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Eve knows: p, g, A (=g^a), B (=g^b)');
    lines.push('    Eve needs: a or b (the private keys)');
    lines.push('');
    lines.push(`    To find a from A = g^a mod p is the`);
    lines.push(`    ${chalk.red('DISCRETE LOGARITHM PROBLEM')}`);
    lines.push('');
    lines.push('    No efficient algorithm exists for large primes!');
    lines.push('    For 2048-bit primes: computationally infeasible');

    return lines.join('\n');
  }
}

/**
 * Discrete Logarithm Problem Visualization
 */
export class DiscreteLogProblem {
  /**
   * Brute force discrete log (for small numbers only)
   */
  static bruteForce(g: bigint, h: bigint, p: bigint): {
    found: boolean;
    exponent?: bigint;
    attempts: number;
    time: number;
  } {
    const start = performance.now();
    const maxAttempts = Math.min(Number(p), 1000000);

    for (let x = 0n; x < BigInt(maxAttempts); x++) {
      if (ModularMath.modPow(g, x, p) === h) {
        return {
          found: true,
          exponent: x,
          attempts: Number(x) + 1,
          time: performance.now() - start
        };
      }
    }

    return {
      found: false,
      attempts: maxAttempts,
      time: performance.now() - start
    };
  }

  /**
   * Visualize the discrete log problem
   */
  static visualize(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         THE DISCRETE LOGARITHM PROBLEM'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Problem Definition:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Given: g, h, p');
    lines.push('    Find:  x such that g^x ≡ h (mod p)');
    lines.push('');

    // Small example
    const g = 5n;
    const p = 23n;

    lines.push(chalk.bold('  Example with small numbers (g=5, p=23):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Powers of 5 mod 23:');

    const powers: bigint[] = [];
    for (let x = 0n; x < p - 1n; x++) {
      powers.push(ModularMath.modPow(g, x, p));
    }

    // Display in rows
    for (let i = 0; i < powers.length; i += 11) {
      let line = '    ';
      for (let j = i; j < Math.min(i + 11, powers.length); j++) {
        line += `5^${j.toString().padStart(2)} = ${chalk.cyan(powers[j].toString().padStart(2))}  `;
      }
      lines.push(line);
    }

    lines.push('');
    lines.push('    Notice how the values appear random!');
    lines.push('    To find x given only the result requires trying each power.');
    lines.push('');

    // Demonstrate difficulty
    lines.push(chalk.bold('  Solving the Problem:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const h = 8n;
    const result = this.bruteForce(g, h, p);

    lines.push(`    Problem: 5^x ≡ ${h} (mod 23)`);
    if (result.found) {
      lines.push(`    Solution: x = ${chalk.green(result.exponent!.toString())}`);
      lines.push(`    Verification: 5^${result.exponent} = ${ModularMath.modPow(g, result.exponent!, p)} (mod 23) ${chalk.green('✓')}`);
      lines.push(`    Attempts needed: ${chalk.yellow(result.attempts.toString())}`);
    }

    lines.push('');
    lines.push(chalk.bold('  Computational Hardness:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const sizes = [
      { bits: 64, name: 'Toy' },
      { bits: 256, name: 'Elliptic Curve' },
      { bits: 1024, name: 'Legacy DH' },
      { bits: 2048, name: 'Standard DH' },
      { bits: 4096, name: 'High Security' }
    ];

    sizes.forEach(s => {
      const keySpace = Math.pow(2, s.bits);
      const time = keySpace / 1e12; // Trillion ops/sec
      lines.push(`    ${s.bits}-bit (${s.name}): ${Visualization.timeEstimate(time)}`);
    });

    lines.push('');
    lines.push(chalk.bold('  Best Known Algorithms:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Baby-step Giant-step: O(√p) time and space');
    lines.push('    Pollard\'s Rho:        O(√p) time, O(1) space');
    lines.push('    Index Calculus:       Subexponential (special cases)');
    lines.push('');
    lines.push(chalk.gray('    Still exponential in bit length of p!'));

    return lines.join('\n');
  }
}

/**
 * Security Reduction Simulator
 */
export class SecurityReduction {
  /**
   * Demonstrate reduction concept
   */
  static demonstrateReduction(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         SECURITY REDUCTIONS'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  What is a Security Reduction?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    A proof technique that shows:');
    lines.push('');
    lines.push('    "If you can break Scheme A,');
    lines.push('     then you can solve Hard Problem B"');
    lines.push('');
    lines.push('    Since B is believed hard, A must be secure.');
    lines.push('');

    // Visual diagram
    lines.push(chalk.bold('  Reduction Diagram:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    ┌─────────────────┐     ┌─────────────────┐');
    lines.push('    │  Attack on      │     │  Solution to    │');
    lines.push('    │  Crypto Scheme  │ ──► │  Hard Problem   │');
    lines.push('    │  (e.g., break   │     │  (e.g., DLog,   │');
    lines.push('    │   Diffie-Helman)│     │   factoring)    │');
    lines.push('    └─────────────────┘     └─────────────────┘');
    lines.push('');
    lines.push('    If the reduction is efficient, breaking the scheme');
    lines.push('    would efficiently solve the hard problem.');
    lines.push('');

    // Concrete example
    lines.push(chalk.bold('  Example: Diffie-Hellman Security'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Computational Diffie-Hellman (CDH) Problem:');
    lines.push('      Given: g, g^a, g^b');
    lines.push('      Compute: g^(ab)');
    lines.push('');
    lines.push('    Decisional Diffie-Hellman (DDH) Problem:');
    lines.push('      Given: g, g^a, g^b, and a candidate Z');
    lines.push('      Decide: Is Z = g^(ab)?');
    lines.push('');
    lines.push('    Reduction chain:');
    lines.push('      DLog ≤ CDH ≤ DDH');
    lines.push('      (each reduces to the previous)');
    lines.push('');

    // Proof template
    lines.push(chalk.bold('  Security Proof Structure:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Theorem: If DDH is hard, then ElGamal is IND-CPA secure');
    lines.push('');
    lines.push('    Proof:');
    lines.push('      1. Assume adversary A breaks ElGamal with advantage ε');
    lines.push('      2. Construct algorithm B that uses A');
    lines.push('      3. Show B solves DDH with advantage ε');
    lines.push('      4. Since DDH is hard, ε must be negligible');
    lines.push('      5. Therefore, ElGamal is secure');
    lines.push('');

    // Quantitative security
    lines.push(chalk.bold('  Quantitative Security:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    For a (t, ε)-secure scheme:');
    lines.push(`      • No adversary running in time ${chalk.cyan('t')}`);
    lines.push(`      • Can break the scheme with probability > ${chalk.cyan('ε')}`);
    lines.push('');
    lines.push('    Typical parameters:');
    lines.push(`      • t = 2^128 operations (${chalk.green('128-bit security')})`);
    lines.push('      • ε = 2^(-128) probability');
    lines.push('');

    lines.push(chalk.gray('  Note: Reductions only prove security relative to hardness assumptions.'));
    lines.push(chalk.gray('  If the underlying problem is eventually solved, security breaks.'));

    return lines.join('\n');
  }

  /**
   * Interactive proof simulation
   */
  static async simulateReduction(): Promise<string> {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         REDUCTION SIMULATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Simulating: Breaking DH ≤ Solving DLog'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    // Small example
    const p = 23n;
    const g = 5n;
    const a = 7n;  // Alice's secret
    const b = 11n; // Bob's secret

    const gA = ModularMath.modPow(g, a, p);
    const gB = ModularMath.modPow(g, b, p);
    const gAB = ModularMath.modPow(g, a * b, p);

    lines.push('    Challenge: Given g^a and g^b, compute g^(ab)');
    lines.push(`      p = ${chalk.cyan(p.toString())}, g = ${chalk.cyan(g.toString())}`);
    lines.push(`      g^a = ${chalk.yellow(gA.toString())}`);
    lines.push(`      g^b = ${chalk.yellow(gB.toString())}`);
    lines.push('');

    lines.push('    Reduction Algorithm:');
    lines.push('      1. Solve DLog: find a from g^a');

    // Brute force DLog
    let foundA = 0n;
    for (let x = 0n; x < p; x++) {
      if (ModularMath.modPow(g, x, p) === gA) {
        foundA = x;
        break;
      }
    }

    lines.push(`         Solved: a = ${chalk.green(foundA.toString())}`);
    lines.push('      2. Compute (g^b)^a = g^(ab)');

    const computed = ModularMath.modPow(gB, foundA, p);
    lines.push(`         Computed: ${chalk.green(computed.toString())}`);
    lines.push('');

    lines.push(`    Verification: g^(ab) = ${chalk.cyan(gAB.toString())}`);
    if (computed === gAB) {
      lines.push(`    ${chalk.green('✓ REDUCTION SUCCESSFUL!')}`);
    }

    lines.push('');
    lines.push(chalk.bold('  Implication:'));
    lines.push('    If we could solve DLog efficiently,');
    lines.push('    we could break Diffie-Hellman efficiently.');
    lines.push('    Since DLog is believed hard, DH is secure.');

    return lines.join('\n');
  }
}

/**
 * El Gamal Encryption Demonstration
 */
export class ElGamal {
  private p: bigint;
  private g: bigint;
  private x: bigint; // Private key
  private y: bigint; // Public key (g^x mod p)

  constructor(primeBits: number = 48) {
    this.p = ModularMath.generatePrime(primeBits);
    this.g = 2n;
    this.x = CryptoRandom.randomBigInt(primeBits - 2);
    this.y = ModularMath.modPow(this.g, this.x, this.p);
  }

  /**
   * Encrypt a message
   */
  encrypt(m: bigint): { c1: bigint; c2: bigint } {
    const k = CryptoRandom.randomBigInt(Number(this.p.toString(2).length) - 2);
    const c1 = ModularMath.modPow(this.g, k, this.p);
    const c2 = (m * ModularMath.modPow(this.y, k, this.p)) % this.p;
    return { c1, c2 };
  }

  /**
   * Decrypt a ciphertext
   */
  decrypt(c1: bigint, c2: bigint): bigint {
    const s = ModularMath.modPow(c1, this.x, this.p);
    const sInv = ModularMath.modInverse(s, this.p);
    return (c2 * sInv) % this.p;
  }

  /**
   * Demonstrate El Gamal
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         EL GAMAL ENCRYPTION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    const elgamal = new ElGamal(32);

    lines.push(chalk.bold('  Key Generation:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Prime p: ${chalk.cyan(elgamal.p.toString())}`);
    lines.push(`    Generator g: ${chalk.cyan(elgamal.g.toString())}`);
    lines.push(`    Private key x: ${chalk.red('[SECRET]')}`);
    lines.push(`    Public key y = g^x: ${chalk.yellow(elgamal.y.toString())}`);
    lines.push('');

    const message = 12345n;
    lines.push(chalk.bold('  Encryption:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Message m: ${chalk.green(message.toString())}`);

    const ciphertext = elgamal.encrypt(message);
    lines.push(`    Ciphertext c1: ${chalk.magenta(ciphertext.c1.toString())}`);
    lines.push(`    Ciphertext c2: ${chalk.magenta(ciphertext.c2.toString())}`);
    lines.push('');

    lines.push(chalk.bold('  Decryption:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const decrypted = elgamal.decrypt(ciphertext.c1, ciphertext.c2);
    lines.push(`    Decrypted: ${chalk.green(decrypted.toString())}`);

    if (decrypted === message) {
      lines.push(`    ${chalk.green('✓ Correctly recovered original message!')}`);
    }

    lines.push('');
    lines.push(chalk.bold('  Security Based On:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Decisional Diffie-Hellman (DDH) Problem');
    lines.push('    Cannot distinguish g^(ab) from random');

    return lines.join('\n');
  }
}

export default {
  ModularMath,
  DiffieHellman,
  DiscreteLogProblem,
  SecurityReduction,
  ElGamal
};
